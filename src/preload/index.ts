import * as electronRenderer from 'electron/renderer'
const { contextBridge, ipcRenderer } = electronRenderer.default || (electronRenderer as any)

const api = {
  loadData: () => ipcRenderer.invoke('load-data'),
  openFileDialog: (title: string) => ipcRenderer.invoke('open-file-dialog', title),
  openCoverDialog: (fileId: string, title: string, filterNames: { imageAndVideo: string; image: string; video: string }) => ipcRenderer.invoke('open-cover-dialog', fileId, title, filterNames),
  addFilesByPath: (paths: string[]) => ipcRenderer.invoke('add-files-by-path', paths),
  deleteFile: (fileId: string) => ipcRenderer.invoke('delete-file', fileId),
  revealInFinder: (filePath: string) => ipcRenderer.invoke('reveal-in-finder', filePath),
  openWithAE: (filePath: string) => ipcRenderer.invoke('open-with-ae', filePath),
  getCoverData: (coverPath: string) => ipcRenderer.invoke('get-cover-data', coverPath),
  createCategory: (name: string) => ipcRenderer.invoke('create-category', name),
  renameCategory: (categoryId: string, name: string) => ipcRenderer.invoke('rename-category', categoryId, name),
  deleteCategory: (categoryId: string) => ipcRenderer.invoke('delete-category', categoryId),
  moveFile: (fileId: string, categoryId: string | null) => ipcRenderer.invoke('move-file', fileId, categoryId)
}

contextBridge.exposeInMainWorld('api', api)

export type API = typeof api
