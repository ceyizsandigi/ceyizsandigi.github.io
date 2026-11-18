import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { downloadCeyizCsv } from '../lib/exportCsv'
import { APP_NAME } from '../lib/brand'

const STATUS_TEXT = {
  idle: '',
  saving: 'Kaydediliyor...',
  saved: 'Kaydedildi',
  error: 'Kaydedilemedi, tekrar denenecek',
}

export default function TopBar({
  saveStatus,
  busy = false,
  showSeedMenu = false,
  categories = [],
  items = [],
  onSeedDefaultList,
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onPointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  async function handleSignOut() {
    setOpen(false)
    await supabase.auth.signOut()
  }

  function handleDownloadCsv() {
    setOpen(false)
    downloadCeyizCsv(categories, items)
  }

  async function handleSeed() {
    setOpen(false)
    if (busy || !onSeedDefaultList) return
    await onSeedDefaultList({ skipExistingCategories: true })
  }

  return (
    <header className="sticky top-0 z-30 bg-black/95 backdrop-blur border-b border-zinc-800 px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
      <h1 className="text-base sm:text-lg font-semibold text-white shrink-0 truncate">
        {APP_NAME}
      </h1>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-zinc-400 truncate text-right max-w-[40vw] sm:max-w-none">
          {STATUS_TEXT[saveStatus] || ''}
        </span>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="Menü"
            onClick={() => setOpen((value) => !value)}
            className="min-h-11 min-w-11 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xl leading-none"
          >
            ⋮
          </button>
          {open ? (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden shadow-lg z-[100]">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="w-full min-h-11 px-4 text-left text-base text-zinc-200 hover:bg-zinc-800"
              >
                Yedeği indir (CSV)
              </button>
              {showSeedMenu ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSeed}
                  className="w-full min-h-11 px-4 text-left text-base text-zinc-200 hover:bg-zinc-800 disabled:opacity-60"
                >
                  Hazır listeyi ekle
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full min-h-11 px-4 text-left text-base text-red-300 hover:bg-zinc-800"
              >
                Çıkış yap
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
