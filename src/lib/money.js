export function parseNumber(value) {
  if (value === '' || value == null) return 0
  const normalized = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
  if (normalized === '' || normalized === '.') return 0
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}

export function formatTLRounded(amount) {
  const value = Math.round(Number(amount) || 0)
  return `${value.toLocaleString('tr-TR')} ₺`
}

export function formatTL(amount) {
  const value = Number(amount) || 0
  return `${value.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ₺`
}

export function currentMonth() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}
