import MonthSelect from './MonthSelect'

export default function MonthPicker({ value, onChange }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Hangi ayı takip ediyorum?</h2>
      <MonthSelect value={value} onChange={onChange} />
      <p className="text-sm text-zinc-500">
        Ayı değiştirerek o ayın taksit yükünü görebilirsin.
      </p>
    </section>
  )
}
