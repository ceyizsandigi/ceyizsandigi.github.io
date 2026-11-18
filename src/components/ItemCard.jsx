import { useState } from 'react'
import { aylikTaksit, kalan, odenen, toNumber } from '../lib/calc'
import { formatTL, parseNumber } from '../lib/money'
import ConfirmDialog from './ConfirmDialog'
import MonthSelect from './MonthSelect'

const fieldClass =
  'w-full max-w-full min-w-0 min-h-11 rounded-xl bg-zinc-950 border border-zinc-700 px-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400'

function FieldLabel({ children }) {
  return <span className="block text-sm text-zinc-400 mb-1.5">{children}</span>
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm min-w-0">
      <span className="text-zinc-400 shrink-0">{label}</span>
      <span className="font-semibold text-white tabular-nums text-right break-all">
        {value}
      </span>
    </div>
  )
}

export default function ItemCard({
  item,
  onUpdate,
  onDelete,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const monthly = aylikTaksit(item)
  const paidAmount = odenen(item)
  const remaining = kalan(item)
  const installments = toNumber(item.installments)
  const paidInstallments = toNumber(item.paid_installments)
  const downTooHigh =
    toNumber(item.down_payment) > toNumber(item.price) && toNumber(item.price) >= 0

  function patchNumber(field, raw, options) {
    onUpdate({ [field]: parseNumber(raw) }, options)
  }

  return (
    <article className="w-full min-w-0 rounded-2xl bg-zinc-950/70 border border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-3 min-w-0">
        <button
          type="button"
          aria-label={open ? 'Ürünü kapat' : 'Ürünü aç'}
          onClick={() => setOpen((value) => !value)}
          className="shrink-0 size-10 sm:size-11 rounded-xl text-zinc-400 text-xl leading-none"
        >
          <span className={`inline-block transition-transform ${open ? 'rotate-90' : ''}`}>
            ›
          </span>
        </button>
        <button
          type="button"
          aria-label={item.purchased ? 'Satın alındı' : 'Satın alınmadı'}
          onClick={() => onUpdate({ purchased: !item.purchased }, { immediate: true })}
          className={`shrink-0 size-10 sm:size-11 rounded-full border-2 flex items-center justify-center text-lg ${
            item.purchased
              ? 'bg-white border-white text-black'
              : 'bg-transparent border-zinc-600 text-transparent'
          }`}
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex-1 min-h-10 sm:min-h-11 text-left px-1 min-w-0 overflow-hidden"
        >
          <p
            className={`text-sm sm:text-base font-medium truncate ${
              item.purchased ? 'line-through text-zinc-400' : 'text-white'
            }`}
          >
            {item.name || 'Ürün adı'}
          </p>
        </button>
        <button
          type="button"
          aria-label="Ürünü sil"
          onClick={() => setConfirmDelete(true)}
          className="shrink-0 size-10 sm:size-11 rounded-xl border border-zinc-700 text-red-300 text-lg"
        >
          ×
        </button>
      </div>

      {open ? (
        <div className="px-2 sm:px-3 pb-4 space-y-4 border-t border-zinc-800 pt-4 min-w-0">
          <label className="block">
            <FieldLabel>Ürün adı</FieldLabel>
            <input
              type="text"
              value={item.name || ''}
              onChange={(event) => onUpdate({ name: event.target.value })}
              className={`w-full min-h-11 rounded-xl bg-zinc-950 border border-zinc-700 px-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                item.purchased ? 'line-through text-zinc-400' : ''
              }`}
              placeholder="Ürün adı"
            />
          </label>

          <div className="space-y-3">
            <label className="block">
              <FieldLabel>Marka</FieldLabel>
              <input
                type="text"
                value={item.brand || ''}
                onChange={(event) => onUpdate({ brand: event.target.value })}
                className={fieldClass}
                placeholder="Marka"
              />
            </label>
            <label className="block">
              <FieldLabel>Model / seri / renk</FieldLabel>
              <input
                type="text"
                value={item.model || ''}
                onChange={(event) => onUpdate({ model: event.target.value })}
                className={fieldClass}
                placeholder="Model / seri / renk"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Alış fiyatı (TL)</FieldLabel>
              <input
                type="text"
                inputMode="decimal"
                value={item.price === 0 || item.price === '0' ? '' : String(item.price ?? '')}
                onChange={(event) => patchNumber('price', event.target.value)}
                className={fieldClass}
                placeholder="0"
              />
            </label>
            <label className="block">
              <FieldLabel>Peşinat (TL)</FieldLabel>
              <input
                type="text"
                inputMode="decimal"
                value={
                  item.down_payment === 0 || item.down_payment === '0'
                    ? ''
                    : String(item.down_payment ?? '')
                }
                onChange={(event) => patchNumber('down_payment', event.target.value)}
                className={`${fieldClass} ${
                  downTooHigh ? 'border-red-500 focus:ring-red-400' : ''
                }`}
                placeholder="0"
              />
            </label>
          </div>
          {downTooHigh ? (
            <p className="text-sm text-red-300">Peşinat, alış fiyatından büyük olamaz.</p>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Taksit sayısı</FieldLabel>
              <input
                type="text"
                inputMode="decimal"
                value={
                  item.installments === 0 || item.installments === '0'
                    ? ''
                    : String(item.installments ?? '')
                }
                onChange={(event) => {
                  const next = Math.floor(parseNumber(event.target.value))
                  onUpdate({ installments: next })
                }}
                className={fieldClass}
                placeholder="Örn. 6"
              />
            </label>
            <MonthSelect
              label="Başlangıç ayı"
              value={item.start_month || ''}
              onChange={(next) => onUpdate({ start_month: next })}
            />
          </div>

          <label className="block">
            <FieldLabel>Ödenen taksit sayısı</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={
                item.paid_installments === 0 || item.paid_installments === '0'
                  ? ''
                  : String(item.paid_installments ?? '')
              }
              onChange={(event) => {
                const next = Math.floor(parseNumber(event.target.value))
                onUpdate({ paid_installments: next })
              }}
              className={fieldClass}
              placeholder="Örn. 0"
            />
            <p className="mt-1.5 text-sm text-zinc-500">
              Ödenen taksit adedini artırdıkça borç otomatik azalır.
            </p>
          </label>

          <div className="rounded-xl bg-black border border-zinc-800 px-4 py-3 space-y-2">
            <ResultRow label="Aylık taksit" value={formatTL(monthly)} />
            <ResultRow label="Kalan borç" value={formatTL(remaining)} />
            <ResultRow
              label="Ödenen taksit"
              value={`${paidInstallments} / ${installments}`}
            />
            <p className="sr-only">Ödenen tutar {formatTL(paidAmount)}</p>
          </div>

          <label className="block">
            <FieldLabel>Not</FieldLabel>
            <textarea
              value={item.note || ''}
              onChange={(event) => onUpdate({ note: event.target.value })}
              rows={3}
              className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-3 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-24"
              placeholder="Açıklama, alışveriş yeri, garanti, ölçü, not..."
            />
          </label>
        </div>
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          title="Emin misiniz?"
          message={`“${item.name || 'Bu ürün'}” silinsin mi? Bu işlem geri alınamaz.`}
          confirmLabel="Evet, sil"
          onConfirm={() => {
            setConfirmDelete(false)
            onDelete()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      ) : null}
    </article>
  )
}
