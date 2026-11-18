import { useRef, useState } from 'react'

export default function ConfirmDialog({
  title = 'Emin misiniz?',
  message,
  confirmLabel = 'Evet, sil',
  cancelLabel = 'İptal',
  onConfirm,
  onCancel,
}) {
  const [submitting, setSubmitting] = useState(false)
  const lockedRef = useRef(false)

  async function handleConfirm() {
    if (lockedRef.current || submitting) return
    lockedRef.current = true
    setSubmitting(true)
    try {
      await onConfirm()
    } finally {
      lockedRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {message ? (
          <p className="text-base text-zinc-300 leading-relaxed">{message}</p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 min-h-11 rounded-xl border border-zinc-700 text-zinc-200 text-base disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 min-h-11 rounded-xl bg-red-600 text-white text-base font-medium disabled:opacity-60"
          >
            {submitting ? 'Siliniyor…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
