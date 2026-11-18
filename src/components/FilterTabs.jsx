const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'todo', label: 'Alınacak' },
  { id: 'done', label: 'Alınan' },
]

export default function FilterTabs({ value, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => {
        const active = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`min-h-11 px-4 rounded-full text-base shrink-0 border ${
              active
                ? 'bg-white text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
