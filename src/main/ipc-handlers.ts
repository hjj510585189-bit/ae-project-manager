import * as electronMain from 'electron/main'
const { ipcMain, dialog, shell, app } = electronMain.default || (electronMain as any)
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { v4 as uuidv4 } from 'uuid'

function getDataDir(): string {
  return join(app.getPath('userData'), 'ae-manager')
}
function getDataFile(): string {
  return join(getDataDir(), 'data.json')
}
function getCoversDir(): string {
  return join(getDataDir(), 'covers')
}

interface Category {
  id: string
  name: string
  createdAt: string
}

interface AEFile {
  id: string
  path: string
  name: string
  coverPath: string | null
  coverType: 'image' | 'video' | null
  addedAt: string
  categoryId: string | null
}

interface AppData {
  files: AEFile[]
  categories: Category[]
}

function ensureDirs(): void {
  const dataDir = getDataDir()
  const coversDir = getCoversDir()
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  if (!existsSync(coversDir)) mkdirSync(coversDir, { recursive: true })
}

function loadData(): AppData {
  ensureDirs()
  const dataFile = getDataFile()
  if (!existsSync(dataFile)) {
    return { files: [], categories: [] }
  }
  try {
    const raw = JSON.parse(readFileSync(dataFile, 'utf-8'))
    // 兼容旧数据
    if (!raw.categories) raw.categories = []
    raw.files = (raw.files || []).map((f: AEFile) => ({
      categoryId: null,
      ...f
    }))
    return raw
  } catch {
    return { files: [], categories: [] }
  }
}

function saveData(data: AppData): void {
  ensureDirs()
  writeFileSync(getDataFile(), JSON.stringify(data, null, 2), 'utf-8')
}

export function registerIpcHandlers(): void {
  // 加载所有数据
  ipcMain.handle('load-data', () => {
    return loadData()
  })

  // 打开 AE 文件选择对话框
  ipcMain.handle('open-file-dialog', async (_, title: string) => {
    const result = await dialog.showOpenDialog({
      title: title || '选择 After Effects 文件',
      filters: [{ name: 'After Effects', extensions: ['aep'] }],
      properties: ['openFile', 'multiSelections']
    })
    if (result.canceled) return null

    const data = loadData()
    const newFiles: AEFile[] = []

    for (const filePath of result.filePaths) {
      if (data.files.find((f) => f.path === filePath)) continue

      newFiles.push({
        id: uuidv4(),
        path: filePath,
        name: basename(filePath),
        coverPath: null,
        coverType: null,
        addedAt: new Date().toISOString(),
        categoryId: null
      })
    }

    data.files = [...data.files, ...newFiles]
    saveData(data)
    return data
  })

  // 打开封面选择对话框
  ipcMain.handle('open-cover-dialog', async (_, fileId: string, title: string, filterNames?: { imageAndVideo: string; image: string; video: string }) => {
    const names = filterNames || { imageAndVideo: '图片和视频', image: '图片', video: '视频' }
    const result = await dialog.showOpenDialog({
      title: title || '选择封面图片或视频',
      filters: [
        { name: names.imageAndVideo, extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'] },
        { name: names.image, extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
        { name: names.video, extensions: ['mp4', 'mov', 'webm'] }
      ],
      properties: ['openFile']
    })
    if (result.canceled) return null

    const sourcePath = result.filePaths[0]
    const ext = extname(sourcePath).toLowerCase()
    const isVideo = ['.mp4', '.mov', '.webm'].includes(ext)

    const destFilename = `${fileId}${ext}`
    const destPath = join(getCoversDir(), destFilename)
    copyFileSync(sourcePath, destPath)

    const data = loadData()
    const file = data.files.find((f) => f.id === fileId)
    if (file) {
      file.coverPath = destPath
      file.coverType = isVideo ? 'video' : 'image'
      saveData(data)
    }

    return data
  })

  // 从拖拽添加文件
  ipcMain.handle('add-files-by-path', (_, paths: string[]) => {
    const data = loadData()
    const newFiles: AEFile[] = []

    for (const filePath of paths) {
      if (!filePath.endsWith('.aep')) continue
      if (data.files.find((f) => f.path === filePath)) continue

      newFiles.push({
        id: uuidv4(),
        path: filePath,
        name: basename(filePath),
        coverPath: null,
        coverType: null,
        addedAt: new Date().toISOString(),
        categoryId: null
      })
    }

    data.files = [...data.files, ...newFiles]
    saveData(data)
    return data
  })

  // 删除文件记录
  ipcMain.handle('delete-file', (_, fileId: string) => {
    const data = loadData()
    data.files = data.files.filter((f) => f.id !== fileId)
    saveData(data)
    return data
  })

  // 在 Finder 中显示文件
  ipcMain.handle('reveal-in-finder', (_, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  // 用 After Effects 打开
  ipcMain.handle('open-with-ae', (_, filePath: string) => {
    shell.openPath(filePath)
  })

  // 获取封面数据 URL（用于显示）
  ipcMain.handle('get-cover-data', (_, coverPath: string) => {
    if (!existsSync(coverPath)) return null
    const ext = extname(coverPath).toLowerCase().slice(1)
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/mp4',
      webm: 'video/webm'
    }
    const mime = mimeTypes[ext] || 'application/octet-stream'
    const buffer = readFileSync(coverPath)
    return `data:${mime};base64,${buffer.toString('base64')}`
  })

  // 创建分类
  ipcMain.handle('create-category', (_, name: string) => {
    const data = loadData()
    data.categories.push({
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString()
    })
    saveData(data)
    return data
  })

  // 重命名分类
  ipcMain.handle('rename-category', (_, categoryId: string, name: string) => {
    const data = loadData()
    const cat = data.categories.find((c) => c.id === categoryId)
    if (cat) cat.name = name
    saveData(data)
    return data
  })

  // 删除分类（该分类下的文件移回未分类）
  ipcMain.handle('delete-category', (_, categoryId: string) => {
    const data = loadData()
    data.categories = data.categories.filter((c) => c.id !== categoryId)
    data.files = data.files.map((f) =>
      f.categoryId === categoryId ? { ...f, categoryId: null } : f
    )
    saveData(data)
    return data
  })

  // 移动文件到分类
  ipcMain.handle('move-file', (_, fileId: string, categoryId: string | null) => {
    const data = loadData()
    const file = data.files.find((f) => f.id === fileId)
    if (file) file.categoryId = categoryId
    saveData(data)
    return data
  })
}
