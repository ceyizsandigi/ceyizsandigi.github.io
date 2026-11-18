import { aylikTaksit, kalan } from './calc'

function escapeCsv(value) {
  const text = value == null ? '' : String(value)
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function formatDateStamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildCeyizCsv(categories, items) {
  const headers = [
    'kategori',
    'ürün',
    'alındı mı',
    'marka',
    'model',
    'fiyat',
    'peşinat',
    'taksit sayısı',
    'başlangıç ayı',
    'ödenen taksit',
    'aylık taksit',
    'kalan borç',
    'not',
  ]

  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  const sortedItems = [...items].sort((a, b) => {
    const categoryA = categoryMap.get(a.category_id)
    const categoryB = categoryMap.get(b.category_id)
    const sortA = categoryA?.sort_order ?? 0
    const sortB = categoryB?.sort_order ?? 0
    if (sortA !== sortB) return sortA - sortB
    return (a.sort_order || 0) - (b.sort_order || 0)
  })

  const rows = sortedItems.map((item) => {
    const category = categoryMap.get(item.category_id)
    return [
      category?.name || '',
      item.name || '',
      item.purchased ? 'Evet' : 'Hayır',
      item.brand || '',
      item.model || '',
      item.price ?? 0,
      item.down_payment ?? 0,
      item.installments ?? 0,
      item.start_month || '',
      item.paid_installments ?? 0,
      Number(aylikTaksit(item).toFixed(2)),
      Number(kalan(item).toFixed(2)),
      item.note || '',
    ]
  })

  const lines = [headers, ...rows].map((row) =>
    row.map(escapeCsv).join(';'),
  )

  return `\uFEFF${lines.join('\n')}`
}

export function downloadCeyizCsv(categories, items) {
  const csv = buildCeyizCsv(categories, items)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ceyiz-yedek-${formatDateStamp()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
