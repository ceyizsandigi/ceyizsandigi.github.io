import { useMemo, useState } from 'react'
import { summarizeFinance } from '../lib/calc'
import { currentMonth } from '../lib/money'
import { useCeyizData } from '../hooks/useCeyizData'
import TopBar from './TopBar'
import FinanceSummary from './FinanceSummary'
import MonthPicker from './MonthPicker'
import FilterTabs from './FilterTabs'
import CategoryCard from './CategoryCard'
import NamePrompt from './NamePrompt'

function filterItems(items, filter) {
  if (filter === 'todo') return items.filter((item) => !item.purchased)
  if (filter === 'done') return items.filter((item) => item.purchased)
  return items
}

export default function Home() {
  const {
    categories,
    items,
    loading,
    error,
    saveStatus,
    busy,
    seedProgress,
    reload,
    addCategory,
    renameCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    clearError,
    seedDefaultList,
  } = useCeyizData()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [filter, setFilter] = useState('all')
  const [addingCategory, setAddingCategory] = useState(false)

  const summary = useMemo(
    () => summarizeFinance(items, selectedMonth),
    [items, selectedMonth],
  )

  const visibleCategories = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: filterItems(
          items.filter((item) => item.category_id === category.id),
          filter,
        ),
      }))
      .filter((entry) => {
        if (filter === 'all') return true
        return entry.items.length > 0
      })
  }, [categories, items, filter])

  async function handleConfirmAddCategory(name) {
    const created = await addCategory(name)
    if (created) setAddingCategory(false)
  }

  async function handleSeedEmpty() {
    await seedDefaultList({ skipExistingCategories: false })
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center text-zinc-400 text-base">
        Yükleniyor…
      </div>
    )
  }

  if (error && categories.length === 0 && saveStatus === 'idle' && !seedProgress) {
    return (
      <div className="min-h-dvh bg-black px-4 py-10 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <h1 className="text-xl font-semibold text-white">Veriler yüklenemedi</h1>
          <p className="text-zinc-400 text-base">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="w-full min-h-11 rounded-xl bg-white text-black text-base font-medium"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-black text-zinc-100 overflow-x-hidden">
      <TopBar
        saveStatus={saveStatus}
        busy={busy}
        showSeedMenu={categories.length > 0}
        categories={categories}
        items={items}
        onSeedDefaultList={seedDefaultList}
      />
      <main className="mx-auto w-full max-w-lg px-4 py-5 space-y-6 pb-10">
        {error ? (
          <div className="rounded-2xl bg-red-950/70 border border-red-900 px-4 py-3 text-sm text-red-200 flex gap-3 items-start">
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="text-red-300 min-h-11 px-2"
            >
              Kapat
            </button>
          </div>
        ) : null}

        {seedProgress ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-700 px-4 py-3 space-y-2">
            <p className="text-sm text-zinc-300">Hazır liste yükleniyor…</p>
            <p className="text-base text-white font-medium truncate">
              {seedProgress.label}
            </p>
            <p className="text-sm text-zinc-500">
              {seedProgress.current} / {seedProgress.total}
            </p>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    (seedProgress.current / Math.max(seedProgress.total, 1)) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <FinanceSummary summary={summary} />
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <FilterTabs value={filter} onChange={setFilter} />

        {categories.length === 0 ? (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 text-center">
            <p className="text-base text-zinc-300">Henüz kategori yok</p>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeedEmpty}
              className="w-full min-h-11 rounded-xl bg-white text-black text-base font-medium disabled:opacity-60"
            >
              {busy ? 'Yükleniyor…' : 'Hazır çeyiz listesini yükle'}
            </button>
            {error ? (
              <button
                type="button"
                disabled={busy}
                onClick={handleSeedEmpty}
                className="w-full min-h-11 rounded-xl border border-zinc-600 text-zinc-200 text-base disabled:opacity-60"
              >
                Tekrar dene
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => setAddingCategory(true)}
              className="w-full min-h-11 rounded-xl border border-zinc-700 text-zinc-200 text-base disabled:opacity-60"
            >
              + Kategori ekle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleCategories.map(({ category, items: categoryItems }) => (
              <CategoryCard
                key={category.id}
                category={category}
                busy={busy}
                items={categoryItems}
                onRename={(name) => renameCategory(category.id, name)}
                onDelete={() => deleteCategory(category.id)}
                onAddItem={() => addItem(category.id)}
                onUpdateItem={updateItem}
                onDeleteItem={deleteItem}
              />
            ))}
            <button
              type="button"
              disabled={busy}
              onClick={() => setAddingCategory(true)}
              className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-base disabled:opacity-60"
            >
              {busy ? 'İşleniyor…' : '+ Kategori ekle'}
            </button>
          </div>
        )}
      </main>

      {addingCategory ? (
        <NamePrompt
          title="Kategori ekle"
          label="Kategori adı"
          confirmLabel="Ekle"
          onConfirm={handleConfirmAddCategory}
          onCancel={() => {
            if (!busy) setAddingCategory(false)
          }}
        />
      ) : null}
    </div>
  )
}
