import { useState, useEffect, useCallback } from 'react'
import Toolbar from './components/Toolbar'
import FileGrid from './components/FileGrid'
import Sidebar from './components/Sidebar'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface AEFile {
  id: string
  path: string
  name: string
  coverPath: string | null
  coverType: 'image' | 'video' | null
  addedAt: string
  categoryId: string | null
}

declare global {
  interface Window {
    api: {
      loadData: () => Promise<{ files: AEFile[]; categories: Category[] }>
      openFileDialog: (title: string) => Promise<{ files: AEFile[]; categories: Category[] } | null>
      openCoverDialog: (fileId: string, title: string, filterNames: { imageAndVideo: string; image: string; video: string }) => Promise<{ files: AEFile[]; categories: Category[] } | null>
      addFilesByPath: (paths: string[]) => Promise<{ files: AEFile[]; categories: Category[] }>
      deleteFile: (fileId: string) => Promise<{ files: AEFile[]; categories: Category[] }>
      revealInFinder: (filePath: string) => Promise<void>
      openWithAE: (filePath: string) => Promise<void>
      getCoverData: (coverPath: string) => Promise<string | null>
      createCategory: (name: string) => Promise<{ files: AEFile[]; categories: Category[] }>
      renameCategory: (categoryId: string, name: string) => Promise<{ files: AEFile[]; categories: Category[] }>
      deleteCategory: (categoryId: string) => Promise<{ files: AEFile[]; categories: Category[] }>
      moveFile: (fileId: string, categoryId: string | null) => Promise<{ files: AEFile[]; categories: Category[] }>
    }
  }
}

function applyData(
  data: { files: AEFile[]; categories: Category[] },
  setFiles: (f: AEFile[]) => void,
  setCategories: (c: Category[]) => void
) {
  setFiles(data.files)
  setCategories(data.categories)
}

function AppInner() {
  const { t } = useLanguage()
  const [files, setFiles] = useState<AEFile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')
  const [cardSize, setCardSize] = useState(180)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    window.api.loadData().then((data) => applyData(data, setFiles, setCategories))
  }, [])

  const handleAddFiles = useCallback(async () => {
    const data = await window.api.openFileDialog(t.selectAEFile)
    if (data) applyData(data, setFiles, setCategories)
  }, [t.selectAEFile])

  const handleSetCover = useCallback(async (fileId: string) => {
    const data = await window.api.openCoverDialog(fileId, t.selectCover, {
      imageAndVideo: t.imageAndVideo,
      image: t.image,
      video: t.video
    })
    if (data) applyData(data, setFiles, setCategories)
  }, [t.selectCover, t.imageAndVideo, t.image, t.video])

  const handleDelete = useCallback(async (fileId: string) => {
    const data = await window.api.deleteFile(fileId)
    applyData(data, setFiles, setCategories)
  }, [])

  const handleMoveFile = useCallback(async (fileId: string, categoryId: string | null) => {
    const data = await window.api.moveFile(fileId, categoryId)
    applyData(data, setFiles, setCategories)
  }, [])

  const handleCreateCategory = useCallback(async () => {
    const data = await window.api.createCategory(t.defaultCategoryName)
    applyData(data, setFiles, setCategories)
    setSelectedCategory(data.categories[data.categories.length - 1].id)
  }, [t.defaultCategoryName])

  const handleRenameCategory = useCallback(async (categoryId: string, name: string) => {
    const data = await window.api.renameCategory(categoryId, name)
    applyData(data, setFiles, setCategories)
  }, [])

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    const data = await window.api.deleteCategory(categoryId)
    applyData(data, setFiles, setCategories)
    if (selectedCategory === categoryId) setSelectedCategory(null)
  }, [selectedCategory])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => f.path)
      .filter((p) => p.endsWith('.aep'))
    if (paths.length > 0) {
      const data = await window.api.addFilesByPath(paths)
      applyData(data, setFiles, setCategories)
    }
  }, [])

  const fileCounts: Record<string, number> = {}
  for (const cat of categories) {
    fileCounts[cat.id] = files.filter((f) => f.categoryId === cat.id).length
  }

  const filteredFiles = files
    .filter((f) => {
      if (selectedCategory === null) return true
      return f.categoryId === selectedCategory
    })
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    })

  return (
    <div
      className={`app ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="title-bar" />
      <div className="app-body">
        <Sidebar
          categories={categories}
          selectedId={selectedCategory}
          fileCounts={fileCounts}
          totalCount={files.length}
          onSelect={setSelectedCategory}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onRenameCategory={handleRenameCategory}
        />
        <div className="main-area">
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onAddFiles={handleAddFiles}
            fileCount={filteredFiles.length}
            cardSize={cardSize}
            onCardSizeChange={setCardSize}
          />
          {filteredFiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <p className="empty-title">{t.emptyTitle}</p>
              <p className="empty-hint">{t.emptyHint}</p>
              <button className="btn-primary" onClick={handleAddFiles}>
                {t.addFile}
              </button>
            </div>
          ) : (
            <FileGrid
              files={filteredFiles}
              cardSize={cardSize}
              categories={categories}
              onSetCover={handleSetCover}
              onDelete={handleDelete}
              onRevealInFinder={(path) => window.api.revealInFinder(path)}
              onOpenWithAE={(path) => window.api.openWithAE(path)}
              onMoveFile={handleMoveFile}
            />
          )}
        </div>
      </div>
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-message">{t.dropHint}</div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  )
}
