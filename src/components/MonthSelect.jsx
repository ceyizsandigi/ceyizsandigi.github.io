import { useEffect, useMemo, useState } from 'react'
import {
  MONTH_SHORT_TR,
  formatMonthLabel,
  formatYearMonth,
  parseYearMonth,
} from '../lib/months'
import { currentMonth } from '../lib/money'

function getInitialView(value) {
  const parsed = parseYearMonth(value) || parseYearMonth(currentMonth())
  return parsed || { year: new Date().getFullYear(), month: 1 }
}

export default function MonthSelect({
  value,
  onChange,
  label,
  placeholder = 'Ay seç',
}) {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseYearMonth(value), [value])
  const [viewYear, setViewYear] = useState(() => getInitialView(value).year)
  const today = useMemo(() => parseYearMonth(currentMonth()), [])

  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function openPicker() {
    setViewYear(getInitialView(value).year)
    setOpen(true)
  }

  function selectMonth(month) {
    onChange(formatYearMonth(viewYear, month))
    setOpen(false)
  }

  function selectThisMonth() {
    onChange(currentMonth())
    setOpen(false)
  }

  return (
    <div className="space-y-1.5">
      {label ? <span className="block text-sm text-zinc-400">{label}</span> : null}
      <button
        type="button"
        onClick={openPicker}
        className="w-full min-h-12 rounded-xl bg-zinc-950 border border-zinc-700 px-4 text-left text-base text-white flex items-center justify-between gap-3 active:bg-zinc-900"
      >
        <span className={selected ? 'text-white' : 'text-zinc-500'}>
          {selected ? formatMonthLabel(value) : placeholder}
        </span>
        <span className="text-zinc-400 text-lg leading-none" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button
            type="button"
            aria-label="Kapat"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-zinc-900 border border-zinc-700 p-5 pb-7 space-y-5 shadow-2xl">
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-700 sm:hidden" />

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                aria-label="Önceki yıl"
                onClick={() => setViewYear((year) => year - 1)}
                className="size-12 rounded-2xl bg-zinc-950 border border-zinc-700 text-white text-2xl leading-none"
              >
                ‹
              </button>
              <div className="text-center">
                <p className="text-2xl font-semibold text-white tabular-nums">{viewYear}</p>
                <p className="text-sm text-zinc-500">Yıl</p>
              </div>
              <button
                type="button"
                aria-label="Sonraki yıl"
                onClick={() => setViewYear((year) => year + 1)}
                className="size-12 rounded-2xl bg-zinc-950 border border-zinc-700 text-white text-2xl leading-none"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {MONTH_SHORT_TR.map((name, index) => {
                const month = index + 1
                const isSelected =
                  selected?.year === viewYear && selected?.month === month
                const isToday = today?.year === viewYear && today?.month === month

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectMonth(month)}
                    className={`min-h-14 rounded-2xl text-base font-medium border ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : isToday
                          ? 'bg-zinc-950 text-white border-zinc-400'
                          : 'bg-zinc-950 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={selectThisMonth}
                className="flex-1 min-h-12 rounded-2xl border border-zinc-600 text-zinc-100 text-base"
              >
                Bu ay
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 min-h-12 rounded-2xl bg-zinc-800 text-white text-base"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
