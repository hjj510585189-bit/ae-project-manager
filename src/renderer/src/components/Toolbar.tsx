import { useLanguage } from '../i18n/LanguageContext'

interface ToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  sortBy: 'name' | 'date'
  onSortChange: (v: 'name' | 'date') => void
  onAddFiles: () => void
  fileCount: number
  cardSize: number
  onCardSizeChange: (v: number) => void
}

export default function Toolbar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  onAddFiles,
  fileCount,
  cardSize,
  onCardSizeChange
}: ToolbarProps) {
  const { t, language, toggleLanguage } = useLanguage()

  return (
    <div className="toolbar">
      <button className="btn-add" onClick={onAddFiles}>
        <span>+</span> {t.addFile}
      </button>
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => onSearchChange('')}>×</button>
        )}
      </div>
      <div className="sort-wrap">
        <button
          className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
          onClick={() => onSortChange('date')}
        >
          {t.sortByDate}
        </button>
        <button
          className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => onSortChange('name')}
        >
          {t.sortByName}
        </button>
      </div>
      <div className="size-slider-wrap">
        <span className="size-icon">⊞</span>
        <input
          className="size-slider"
          type="range"
          min={120}
          max={320}
          step={10}
          value={cardSize}
          onChange={(e) => onCardSizeChange(Number(e.target.value))}
        />
      </div>
      <span className="file-count">{t.fileCount(fileCount)}</span>
      <button className="lang-btn" onClick={toggleLanguage}>
        {language === 'zh' ? 'EN' : '中'}
      </button>
    </div>
  )
}
