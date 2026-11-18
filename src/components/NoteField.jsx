import { useEffect, useRef, useState } from 'react'
import { hrefForUrl, splitLinks } from '../lib/linkify'

function LinkifiedText({ text }) {
  const parts = splitLinks(text)
  if (parts.length === 0) return null

  return (
    <p className="text-base text-white whitespace-pre-wrap break-words leading-relaxed">
      {parts.map((part, index) => {
        if (part.type !== 'link') {
          return <span key={`${index}-${part.value.slice(0, 12)}`}>{part.value}</span>
        }

        return (
          <a
            key={`${index}-${part.value}`}
            href={hrefForUrl(part.value)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="text-sky-300 underline underline-offset-2 break-all"
          >
            {part.value}
          </a>
        )
      })}
    </p>
  )
}

export default function NoteField({ value, onChange, placeholder }) {
  const [editing, setEditing] = useState(!value)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!editing) return
    const node = textareaRef.current
    if (!node) return
    node.focus()
    const length = node.value.length
    node.setSelectionRange(length, length)
  }, [editing])

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setEditing(false)}
        rows={3}
        className="w-full max-w-full min-w-0 rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-24"
        placeholder={placeholder}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="w-full min-h-24 rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-3 text-left"
    >
      {value?.trim() ? (
        <LinkifiedText text={value} />
      ) : (
        <span className="text-base text-zinc-500">{placeholder}</span>
      )}
      <span className="mt-2 block text-xs text-zinc-500">Düzenlemek için dokun</span>
    </button>
  )
}
