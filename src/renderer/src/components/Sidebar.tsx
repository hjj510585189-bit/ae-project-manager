import { useState, useRef, useEffect } from 'react'
import { Category } from '../App'
import { useLanguage } from '../i18n/LanguageContext'

interface SidebarProps {
  categories: Category[]
  selectedId: string | null
  fileCounts: Record<string, number>
  totalCount: number
  onSelect: (id: string | null) => void
  onCreateCategory: () => void
  onDeleteCategory: (id: string) => void
  onRenameCategory: (id: string, name: string) => void
}

export default function Sidebar({
  categories,
  selectedId,
  fileCounts,
  totalCount,
  onSelect,
  onCreateCategory,
  onDeleteCategory,
  onRenameCategory
}: SidebarProps) {
  const { t } = useLanguage()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  const commitEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameCategory(editingId, editingName.trim())
    }
    setEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div className="sidebar">
      <div
        className={`sidebar-item ${selectedId === null ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span className="sidebar-icon">◈</span>
        <span className="sidebar-label">{t.allFiles}</span>
        <span className="sidebar-count">{totalCount}</span>
      </div>

      {categories.length > 0 && <div className="sidebar-divider" />}

      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`sidebar-item ${selectedId === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
          onDoubleClick={() => startEdit(cat)}
        >
          <span className="sidebar-icon">◇</span>
          {editingId === cat.id ? (
            <input
              ref={inputRef}
              className="sidebar-edit-input"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="sidebar-label">{cat.name}</span>
          )}
          <span className="sidebar-count">{fileCounts[cat.id] ?? 0}</span>
          <button
            className="sidebar-delete"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteCategory(cat.id)
            }}
            title={t.deleteCategory}
          >
            ×
          </button>
        </div>
      ))}

      <div className="sidebar-divider" />
      <button className="sidebar-add" onClick={onCreateCategory}>
        + {t.newCategory}
      </button>
    </div>
  )
}
