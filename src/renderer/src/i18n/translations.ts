export type Language = 'zh' | 'en'

export interface Translations {
  addFile: string
  searchPlaceholder: string
  sortByDate: string
  sortByName: string
  fileCount: (n: number) => string
  allFiles: string
  newCategory: string
  deleteCategory: string
  defaultCategoryName: string
  emptyTitle: string
  emptyHint: string
  dropHint: string
  openInAE: string
  showInFinder: string
  setCover: string
  changeCover: string
  moveToCategory: string
  removeFromCategory: string
  removeFromList: string
  selectAEFile: string
  selectCover: string
  imageAndVideo: string
  image: string
  video: string
  dateLocale: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    addFile: '添加文件',
    searchPlaceholder: '搜索文件名...',
    sortByDate: '最新',
    sortByName: '名称',
    fileCount: (n: number) => `${n} 个文件`,
    allFiles: '全部文件',
    newCategory: '新建分类',
    deleteCategory: '删除分类',
    defaultCategoryName: '新分类',
    emptyTitle: '还没有 AE 文件',
    emptyHint: '点击「添加文件」或拖拽 .aep 文件到此处',
    dropHint: '释放以添加 AE 文件',
    openInAE: '用 AE 打开',
    showInFinder: '在 Finder 中显示',
    setCover: '设置封面',
    changeCover: '更换封面',
    moveToCategory: '移至分类',
    removeFromCategory: '从分类移除',
    removeFromList: '从列表移除',
    selectAEFile: '选择 After Effects 文件',
    selectCover: '选择封面图片或视频',
    imageAndVideo: '图片和视频',
    image: '图片',
    video: '视频',
    dateLocale: 'zh-CN'
  },
  en: {
    addFile: 'Add File',
    searchPlaceholder: 'Search filename...',
    sortByDate: 'Latest',
    sortByName: 'Name',
    fileCount: (n: number) => `${n} file${n !== 1 ? 's' : ''}`,
    allFiles: 'All Files',
    newCategory: 'New Category',
    deleteCategory: 'Delete Category',
    defaultCategoryName: 'New Category',
    emptyTitle: 'No AE Files Yet',
    emptyHint: 'Click "Add File" or drag .aep files here',
    dropHint: 'Drop to Add AE Files',
    openInAE: 'Open in AE',
    showInFinder: 'Show in Finder',
    setCover: 'Set Cover',
    changeCover: 'Change Cover',
    moveToCategory: 'Move to Category',
    removeFromCategory: 'Remove from Category',
    removeFromList: 'Remove from List',
    selectAEFile: 'Select After Effects Files',
    selectCover: 'Select Cover Image or Video',
    imageAndVideo: 'Images & Videos',
    image: 'Images',
    video: 'Videos',
    dateLocale: 'en-US'
  }
}
