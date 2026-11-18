import { useEffect, useRef, useState } from 'react'

export default function NamePrompt({
  title,
  label = 'Ad',
  initialValue = '',
  confirmLabel = 'Kaydet',
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)
  const lockedRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (lockedRef.current || submitting) return
    const trimmed = value.trim()
    if (!trimmed) return
    lockedRef.current = true
    setSubmitting(true)
    try {
      await onConfirm(trimmed)
    } finally {
      lockedRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 px-4 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-5 space-y-4"
      >
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <label className="block space-y-2">
          <span className="text-sm text-zinc-400">{label}</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            disabled={submitting}
            onChange={(event) => setValue(event.target.value)}
            className="w-full min-h-11 rounded-xl bg-zinc-950 border border-zinc-700 px-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60"
            placeholder="Örn. Mutfak"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 min-h-11 rounded-xl border border-zinc-700 text-zinc-200 text-base disabled:opacity-60"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 min-h-11 rounded-xl bg-white text-black text-base font-medium disabled:opacity-60"
          >
            {submitting ? 'Kaydediliyor…' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
