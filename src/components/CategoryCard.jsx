import { useEffect, useRef, useState } from 'react'
import ItemCard from './ItemCard'
import NamePrompt from './NamePrompt'
import ConfirmDialog from './ConfirmDialog'

export default function CategoryCard({
  category,
  items,
  busy = false,
  onRename,
  onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) {
  const [open, setOpen] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef(null)
  const purchasedCount = items.filter((item) => item.purchased).length

  useEffect(() => {
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleRename() {
    setMenuOpen(false)
    setRenaming(true)
  }

  function handleDelete() {
    setMenuOpen(false)
    setConfirmDelete(true)
  }

  return (
    <section className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="flex items-stretch gap-1 p-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex-1 min-h-14 px-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-zinc-400 transition-transform ${open ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ›
            </span>
            <div>
              <p className="text-base font-semibold text-white">{category.name}</p>
              <p className="text-sm text-zinc-500">
                {purchasedCount} / {items.length} satın alındı
              </p>
            </div>
          </div>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Kategori menüsü"
            onClick={() => setMenuOpen((value) => !value)}
            className="min-h-11 min-w-11 rounded-xl text-white text-xl"
          >
            ⋯
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden z-10 shadow-lg">
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
            </div>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="px-3 pb-3 space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
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
