export const MONTH_NAMES_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

export const MONTH_SHORT_TR = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
]

export function parseYearMonth(value) {
  if (!value || typeof value !== 'string') return null
  const [yearText, monthText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  if (!year || !month || month < 1 || month > 12) return null
  return { year, month }
}

export function formatYearMonth(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function formatMonthLabel(value) {
  const parsed = parseYearMonth(value)
  if (!parsed) return 'Ay seç'
  return `${MONTH_NAMES_TR[parsed.month - 1]} ${parsed.year}`
}
