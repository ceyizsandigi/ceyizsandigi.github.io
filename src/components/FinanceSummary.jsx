import { formatTLRounded } from '../lib/money'

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white tabular-nums">
        {formatTLRounded(value)}
      </p>
    </div>
  )
}

export default function FinanceSummary({ summary }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Finansal durum</h2>
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Toplam alışveriş" value={summary.toplamAlisveris} />
        <SummaryCard label="Aylık taksit yükü" value={summary.aylikTaksitYuku} />
        <SummaryCard label="Ödenen toplam" value={summary.odenenToplam} />
        <SummaryCard label="Kalan taksit borcu" value={summary.kalanTaksitBorcu} />
      </div>
      <p className="text-sm text-zinc-500 leading-relaxed">
        Aylık taksit yükü, seçtiğin ayda devam eden taksitleri gösterir. Ödenen
        toplam peşinat + işaretlenen taksitlerdir.
      </p>
      <p className="text-sm text-zinc-300">
        Planlanan toplam (alınacaklar dahil):{' '}
        <span className="font-semibold text-white">
          {formatTLRounded(summary.planlananToplam)}
        </span>
      </p>
    </section>
  )
}
