import { AEFile, Category } from '../App'
import FileCard from './FileCard'

interface FileGridProps {
  files: AEFile[]
  cardSize: number
  categories: Category[]
  onSetCover: (id: string) => void
  onDelete: (id: string) => void
  onRevealInFinder: (path: string) => void
  onOpenWithAE: (path: string) => void
  onMoveFile: (fileId: string, categoryId: string | null) => void
}

export default function FileGrid({
  files,
  cardSize,
  categories,
  onSetCover,
  onDelete,
  onRevealInFinder,
  onOpenWithAE,
  onMoveFile
}: FileGridProps) {
  return (
    <div className="file-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize}px, 1fr))` }}>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          categories={categories}
          onSetCover={onSetCover}
          onDelete={onDelete}
          onRevealInFinder={onRevealInFinder}
          onOpenWithAE={onOpenWithAE}
          onMoveFile={onMoveFile}
        />
      ))}
    </div>
  )
}
