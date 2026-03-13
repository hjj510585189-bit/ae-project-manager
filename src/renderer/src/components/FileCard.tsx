import { useRef, useState, useEffect } from 'react'
import { AEFile, Category } from '../App'
import { useLanguage } from '../i18n/LanguageContext'

interface FileCardProps {
  file: AEFile
  categories: Category[]
  onSetCover: (id: string) => void
  onDelete: (id: string) => void
  onRevealInFinder: (path: string) => void
  onOpenWithAE: (path: string) => void
  onMoveFile: (fileId: string, categoryId: string | null) => void
}

export default function FileCard({
  file,
  categories,
  onSetCover,
  onDelete,
  onRevealInFinder,
  onOpenWithAE,
  onMoveFile
}: FileCardProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [coverData, setCoverData] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuDir, setMenuDir] = useState<'down' | 'up'>('down')
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (file.coverPath) {
      window.api.getCoverData(file.coverPath).then(setCoverData)
    } else {
      setCoverData(null)
    }
  }, [file.coverPath])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const displayName = file.name.replace(/\.aep$/i, '')
  const addedDate = new Date(file.addedAt).toLocaleDateString(t.dateLocale, {
    month: 'short',
    day: 'numeric'
  })

  const closeMenu = () => setMenuOpen(false)

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const menuHeight = 200
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setMenuDir(spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? 'down' : 'up')
    }
    setMenuOpen((v) => !v)
  }

  const menuStyle = menuDir === 'up'
    ? { bottom: 'calc(100% + 4px)', top: 'auto' }
    : { top: 'calc(100% + 4px)', bottom: 'auto' }

  return (
    <div className="file-card" style={{ zIndex: menuOpen ? 10 : undefined }} onDoubleClick={() => !menuOpen && onOpenWithAE(file.path)}>
      <div
        className="card-cover"
        onMouseEnter={() => file.coverType === 'video' && videoRef.current?.play()}
        onMouseLeave={() => {
          if (file.coverType === 'video' && videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
        }}
      >
        {coverData && file.coverType === 'video' ? (
          <video
            ref={videoRef}
            src={coverData}
            muted
            autoPlay
            loop
            playsInline
            className="cover-media"
          />
        ) : coverData && file.coverType === 'image' ? (
          <img src={coverData} alt={file.name} className="cover-media" />
        ) : (
          <div className="cover-placeholder">
            <span className="ae-icon">Ae</span>
          </div>
        )}
      </div>

      <div className="card-info">
        <span className="card-name" title={file.name}>{displayName}</span>
        <div className="card-meta">
          <span className="card-date">{addedDate}</span>
          <div className="card-menu-wrap" ref={menuRef}>
            <button
              ref={btnRef}
              className={`card-menu-btn${menuOpen ? ' active' : ''}`}
              onClick={handleMenuToggle}
            >
              ···
            </button>
            {menuOpen && (
              <div className="card-menu" style={menuStyle}>
                <button onClick={() => { onOpenWithAE(file.path); closeMenu() }}>
                  {t.openInAE}
                </button>
                <button onClick={() => { onRevealInFinder(file.path); closeMenu() }}>
                  {t.showInFinder}
                </button>
                <button onClick={() => { onSetCover(file.id); closeMenu() }}>
                  {file.coverPath ? t.changeCover : t.setCover}
                </button>
                {categories.length > 0 && (
                  <div className="menu-item-with-sub">
                    <button className="menu-has-sub">
                      {t.moveToCategory} <span>›</span>
                    </button>
                    <div className="card-submenu">
                      {file.categoryId !== null && (
                        <button onClick={() => { onMoveFile(file.id, null); closeMenu() }}>
                          {t.removeFromCategory}
                        </button>
                      )}
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          className={file.categoryId === cat.id ? 'menu-active' : ''}
                          onClick={() => { onMoveFile(file.id, cat.id); closeMenu() }}
                        >
                          {file.categoryId === cat.id ? '✓ ' : ''}{cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="menu-delete"
                  onClick={() => { onDelete(file.id); closeMenu() }}
                >
                  {t.removeFromList}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
