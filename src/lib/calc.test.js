import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  aylikTaksit,
  odenen,
  kalan,
  monthToInt,
  isMonthInInstallmentRange,
  aylikTaksitYuku,
  toplamAlisveris,
  odenenToplam,
  kalanTaksitBorcu,
  planlananToplam,
} from './calc.js'

describe('aylikTaksit', () => {
  it('taksit yoksa 0 döner', () => {
    assert.equal(aylikTaksit({ price: 1000, down_payment: 200, installments: 0 }), 0)
  })

  it('peşinat sonrası tutarı böler', () => {
    assert.equal(aylikTaksit({ price: 1000, down_payment: 200, installments: 4 }), 200)
  })

  it('peşinat fiyattan büyükse 0 döner', () => {
    assert.equal(aylikTaksit({ price: 100, down_payment: 150, installments: 3 }), 0)
  })
})

describe('odenen ve kalan', () => {
  it('taksitsiz üründe tamamı ödenmiş sayılır', () => {
    const item = { price: 500, down_payment: 0, installments: 0, paid_installments: 0 }
    assert.equal(odenen(item), 500)
    assert.equal(kalan(item), 0)
  })

  it('peşinat + ödenen taksitleri toplar ve fiyatı aşmaz', () => {
    const item = {
      price: 1000,
      down_payment: 200,
      installments: 4,
      paid_installments: 2,
    }
    assert.equal(odenen(item), 600)
    assert.equal(kalan(item), 400)
  })

  it('odenen fiyatı geçemez', () => {
    const item = {
      price: 1000,
      down_payment: 200,
      installments: 4,
      paid_installments: 10,
    }
    assert.equal(odenen(item), 1000)
    assert.equal(kalan(item), 0)
  })
})

describe('ay aralığı', () => {
  it('monthToInt doğru hesaplar', () => {
    assert.equal(monthToInt('2026-01'), 2026 * 12 + 1)
    assert.equal(monthToInt('2026-11'), 2026 * 12 + 11)
  })

  it('seçili ay taksit aralığında mı bakar', () => {
    assert.equal(isMonthInInstallmentRange('2026-03', '2026-01', 3), true)
    assert.equal(isMonthInInstallmentRange('2026-04', '2026-01', 3), false)
    assert.equal(isMonthInInstallmentRange('2025-12', '2026-01', 3), false)
  })
})

describe('özetler', () => {
  const items = [
    {
      purchased: true,
      price: 1000,
      down_payment: 200,
      installments: 4,
      paid_installments: 1,
      start_month: '2026-01',
    },
    {
      purchased: false,
      price: 500,
      down_payment: 0,
      installments: 5,
      paid_installments: 0,
      start_month: '2026-01',
    },
    {
      purchased: true,
      price: 300,
      down_payment: 0,
      installments: 0,
      paid_installments: 0,
      start_month: '2026-01',
    },
  ]

  it('aylık taksit yükü yalnız purchased ve aralıktaki taksitleri toplar', () => {
    assert.equal(aylikTaksitYuku(items, '2026-02'), 200)
    assert.equal(aylikTaksitYuku(items, '2026-05'), 0)
  })

  it('toplam alışveriş / ödenen / kalan yalnız purchased', () => {
    assert.equal(toplamAlisveris(items), 1300)
    assert.equal(odenenToplam(items), 400 + 300)
    assert.equal(kalanTaksitBorcu(items), 600 + 0)
  })

  it('planlanan toplam tüm ürünleri kapsar', () => {
    assert.equal(planlananToplam(items), 1800)
  })
})
