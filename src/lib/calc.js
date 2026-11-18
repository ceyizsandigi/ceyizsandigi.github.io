export function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function aylikTaksit(item) {
  const installments = toNumber(item.installments)
  if (installments <= 0) return 0
  const principal = Math.max(0, toNumber(item.price) - toNumber(item.down_payment))
  return principal / installments
}

export function odenen(item) {
  const price = toNumber(item.price)
  const installments = toNumber(item.installments)
  if (installments <= 0) return price
  const paid = toNumber(item.paid_installments)
  return Math.min(
    toNumber(item.down_payment) + paid * aylikTaksit(item),
    price,
  )
}

export function kalan(item) {
  return toNumber(item.price) - odenen(item)
}

export function monthToInt(yyyyMm) {
  if (!yyyyMm || typeof yyyyMm !== 'string') return 0
  const [year, month] = yyyyMm.split('-').map(Number)
  if (!year || !month) return 0
  return year * 12 + month
}

export function isMonthInInstallmentRange(selectedMonth, startMonth, installments) {
  const count = toNumber(installments)
  if (count <= 0 || !startMonth || !selectedMonth) return false
  const selected = monthToInt(selectedMonth)
  const start = monthToInt(startMonth)
  if (!selected || !start) return false
  const end = start + count - 1
  return selected >= start && selected <= end
}

export function aylikTaksitYuku(items, selectedMonth) {
  return items
    .filter((item) => item.purchased)
    .filter((item) => toNumber(item.installments) > 0)
    .filter((item) =>
      isMonthInInstallmentRange(
        selectedMonth,
        item.start_month,
        item.installments,
      ),
    )
    .reduce((sum, item) => sum + aylikTaksit(item), 0)
}

export function toplamAlisveris(items) {
  return items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + toNumber(item.price), 0)
}

export function odenenToplam(items) {
  return items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + odenen(item), 0)
}

export function kalanTaksitBorcu(items) {
  return items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + kalan(item), 0)
}

export function planlananToplam(items) {
  return items.reduce((sum, item) => sum + toNumber(item.price), 0)
}

export function summarizeFinance(items, selectedMonth) {
  return {
    toplamAlisveris: toplamAlisveris(items),
    aylikTaksitYuku: aylikTaksitYuku(items, selectedMonth),
    odenenToplam: odenenToplam(items),
    kalanTaksitBorcu: kalanTaksitBorcu(items),
    planlananToplam: planlananToplam(items),
  }
}
