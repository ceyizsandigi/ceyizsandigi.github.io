import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ItemCard from './ItemCard'
import NamePrompt from './NamePrompt'
import ConfirmDialog from './ConfirmDialog'

export default function CategoryCard({
  category,
  items,
  busy = false,
  defaultOpen = false,
  itemsDefaultOpen = false,
  expandToken = 0,
  onRename,
  onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const purchasedCount = items.filter((item) => item.purchased).length

  useLayoutEffect(() => {
    if (!menuOpen || !menuButtonRef.current) return undefined

    function updatePosition() {
      const rect = menuButtonRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return undefined

    function onPointerDown(event) {
      const inButton = menuButtonRef.current?.contains(event.target)
      const inMenu = menuRef.current?.contains(event.target)
      if (!inButton && !inMenu) setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  function handleRename() {
    setMenuOpen(false)
    setRenaming(true)
  }

  function handleDelete() {
    setMenuOpen(false)
    setConfirmDelete(true)
  }

  return (
    <section className="w-full min-w-0 rounded-2xl bg-zinc-900 border border-zinc-800">
      <div className="flex items-stretch gap-1 p-2 min-w-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex-1 min-h-14 min-w-0 px-2 sm:px-3 text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ›
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-white truncate">
                {category.name}
              </p>
              <p className="text-sm text-zinc-500 truncate">
                {purchasedCount} / {items.length} satın alındı
              </p>
            </div>
          </div>
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Kategori menüsü"
          onClick={() => setMenuOpen((value) => !value)}
          className="shrink-0 min-h-11 min-w-11 rounded-xl text-white text-xl"
        >
          ⋯
        </button>
      </div>

      {menuOpen
        ? createPortal(
            <div
              ref={menuRef}
              style={{ top: menuPos.top, right: menuPos.right }}
              className="fixed z-[100] w-48 max-w-[calc(100vw-1rem)] rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden shadow-2xl"
            >
              <button
                type="button"
                onClick={handleRename}
                className="w-full min-h-11 px-4 text-left text-base text-zinc-200 hover:bg-zinc-800"
              >
                Yeniden adlandır
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full min-h-11 px-4 text-left text-base text-red-300 hover:bg-zinc-800"
              >
                Sil
              </button>
            </div>,
            document.body,
          )
        : null}

      {open ? (
        <div className="px-2 sm:px-3 pb-3 space-y-3 min-w-0">
          {items.map((item) => (
            <ItemCard
              key={`${item.id}-${expandToken}`}
              item={item}
              defaultOpen={itemsDefaultOpen}
              onUpdate={(patch, options) => onUpdateItem(item.id, patch, options)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={onAddItem}
            className="w-full min-h-11 rounded-xl border border-dashed border-zinc-600 text-zinc-200 text-base disabled:opacity-60"
          >
            {busy ? 'Ekleniyor…' : '+ Ürün ekle'}
          </button>
        </div>
      ) : null}

      {renaming ? (
        <NamePrompt
          title="Kategoriyi yeniden adlandır"
          label="Kategori adı"
          initialValue={category.name}
          confirmLabel="Kaydet"
          onConfirm={(name) => {
            setRenaming(false)
            onRename(name)
          }}
          onCancel={() => setRenaming(false)}
        />
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          title="Emin misiniz?"
          message={`“${category.name}” kategorisi ve içindeki ürünler silinsin mi? Bu işlem geri alınamaz.`}
          confirmLabel="Evet, sil"
          onConfirm={() => {
            setConfirmDelete(false)
            onDelete()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : null}
    </section>
  )
}
