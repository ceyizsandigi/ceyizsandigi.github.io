import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { currentMonth } from '../lib/money'
import { DEFAULT_LIST } from '../data/defaultList'

const DEBOUNCE_MS = 600

export function useCeyizData() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [seedProgress, setSeedProgress] = useState(null)

  const timersRef = useRef(new Map())
  const pendingPayloadsRef = useRef(new Map())
  const retryTimersRef = useRef(new Map())
  const mountedRef = useRef(true)
  const flushUpdateRef = useRef(null)
  const itemsRef = useRef([])
  const actionLockRef = useRef(false)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const bumpPending = useCallback((delta) => {
    setPendingCount((count) => Math.max(0, count + delta))
  }, [])

  const setStatusSafe = useCallback((status) => {
    if (mountedRef.current) setSaveStatus(status)
  }, [])

  const runExclusive = useCallback(async (fn) => {
    if (actionLockRef.current) return null
    actionLockRef.current = true
    if (mountedRef.current) setBusy(true)
    try {
      return await fn()
    } finally {
      actionLockRef.current = false
      if (mountedRef.current) setBusy(false)
    }
  }, [])

  const flushUpdate = useCallback(
    async (table, id, payload) => {
      setStatusSafe('saving')
      bumpPending(1)
      try {
        const { error: updateError } = await supabase
          .from(table)
          .update(payload)
          .eq('id', id)

        if (updateError) throw updateError
        setStatusSafe('saved')
      } catch {
        setStatusSafe('error')
        const retryKey = `${table}:${id}`
        if (retryTimersRef.current.has(retryKey)) {
          clearTimeout(retryTimersRef.current.get(retryKey))
        }
        const timer = setTimeout(() => {
          retryTimersRef.current.delete(retryKey)
          const latest = pendingPayloadsRef.current.get(retryKey)
          if (latest) {
            flushUpdateRef.current?.(table, id, latest)
          }
        }, 2000)
        retryTimersRef.current.set(retryKey, timer)
      } finally {
        bumpPending(-1)
      }
    },
    [bumpPending, setStatusSafe],
  )

  useEffect(() => {
    flushUpdateRef.current = flushUpdate
  }, [flushUpdate])

  const scheduleUpdate = useCallback(
    (table, id, payload, { immediate = false } = {}) => {
      const key = `${table}:${id}`
      const previous = pendingPayloadsRef.current.get(key) || {}
      const nextPayload = { ...previous, ...payload }
      pendingPayloadsRef.current.set(key, nextPayload)

      if (timersRef.current.has(key)) {
        clearTimeout(timersRef.current.get(key))
        timersRef.current.delete(key)
      }

      if (immediate) {
        pendingPayloadsRef.current.delete(key)
        flushUpdate(table, id, nextPayload)
        return
      }

      const timer = setTimeout(() => {
        timersRef.current.delete(key)
        const latest = pendingPayloadsRef.current.get(key)
        pendingPayloadsRef.current.delete(key)
        if (latest) flushUpdate(table, id, latest)
      }, DEBOUNCE_MS)

      timersRef.current.set(key, timer)
      setStatusSafe('saving')
    },
    [flushUpdate, setStatusSafe],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('items').select('*').order('sort_order', { ascending: true }),
      ])

      if (categoriesRes.error) throw categoriesRes.error
      if (itemsRes.error) throw itemsRes.error

      if (!mountedRef.current) return
      setCategories(categoriesRes.data || [])
      setItems(itemsRes.data || [])
    } catch (err) {
      if (!mountedRef.current) return
      setError(err?.message || 'Veriler yüklenemedi.')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const timers = timersRef.current
    const retries = retryTimersRef.current

    const timeoutId = window.setTimeout(() => {
      load()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      mountedRef.current = false
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
      retries.forEach((timer) => clearTimeout(timer))
      retries.clear()
    }
  }, [load])

  useEffect(() => {
    function onBeforeUnload(event) {
      const hasPending =
        pendingCount > 0 ||
        saveStatus === 'saving' ||
        timersRef.current.size > 0 ||
        pendingPayloadsRef.current.size > 0
      if (!hasPending) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [pendingCount, saveStatus])

  const updateCategoryLocal = useCallback((id, patch) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, ...patch } : category,
      ),
    )
  }, [])

  const renameCategory = useCallback(
    (id, name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      updateCategoryLocal(id, { name: trimmed })
      scheduleUpdate('categories', id, { name: trimmed })
    },
    [scheduleUpdate, updateCategoryLocal],
  )

  const deleteCategory = useCallback(
    (id) =>
      runExclusive(async () => {
        setStatusSafe('saving')
        bumpPending(1)
        setCategories((prev) => prev.filter((category) => category.id !== id))
        setItems((prev) => prev.filter((item) => item.category_id !== id))
        try {
          const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
          if (deleteError) throw deleteError
          setStatusSafe('saved')
        } catch {
          setStatusSafe('error')
          await load()
        } finally {
          bumpPending(-1)
        }
      }),
    [bumpPending, load, runExclusive, setStatusSafe],
  )

  const addCategory = useCallback(
    (name) =>
      runExclusive(async () => {
        const trimmed = name.trim()
        if (!trimmed) return null
        setError('')
        setStatusSafe('saving')
        bumpPending(1)
        try {
          const sortOrder =
            categories.reduce(
              (max, category) => Math.max(max, category.sort_order || 0),
              0,
            ) + 1
          const { data, error: insertError } = await supabase
            .from('categories')
            .insert({ name: trimmed, sort_order: sortOrder })
            .select()
            .single()
          if (insertError) throw insertError
          setCategories((prev) => [...prev, data])
          setStatusSafe('saved')
          return data
        } catch (err) {
          setStatusSafe('error')
          setError(translateDbError(err, 'Kategori eklenemedi.'))
          return null
        } finally {
          bumpPending(-1)
        }
      }),
    [bumpPending, categories, runExclusive, setStatusSafe],
  )

  const addItem = useCallback(
    (categoryId) =>
      runExclusive(async () => {
        setStatusSafe('saving')
        bumpPending(1)
        try {
          const categoryItems = items.filter(
            (item) => item.category_id === categoryId,
          )
          const sortOrder =
            categoryItems.reduce(
              (max, item) => Math.max(max, item.sort_order || 0),
              0,
            ) + 1
          const { data, error: insertError } = await supabase
            .from('items')
            .insert({
              category_id: categoryId,
              name: 'Yeni ürün',
              sort_order: sortOrder,
              start_month: currentMonth(),
            })
            .select()
            .single()
          if (insertError) throw insertError
          setItems((prev) => [...prev, data])
          setStatusSafe('saved')
          return data
        } catch (err) {
          setStatusSafe('error')
          setError(translateDbError(err, 'Ürün eklenemedi.'))
          return null
        } finally {
          bumpPending(-1)
        }
      }),
    [bumpPending, items, runExclusive, setStatusSafe],
  )

  const updateItem = useCallback(
    (id, patch, options = {}) => {
      const current = itemsRef.current.find((item) => item.id === id)
      if (!current) return

      let nextPatch = { ...patch }
      if ('paid_installments' in nextPatch || 'installments' in nextPatch) {
        const installments =
          'installments' in nextPatch
            ? nextPatch.installments
            : current.installments
        const paid =
          'paid_installments' in nextPatch
            ? nextPatch.paid_installments
            : current.paid_installments
        nextPatch = {
          ...nextPatch,
          paid_installments: Math.min(
            Number(paid) || 0,
            Number(installments) || 0,
          ),
        }
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...nextPatch } : item,
        ),
      )
      scheduleUpdate('items', id, nextPatch, options)
    },
    [scheduleUpdate],
  )

  const deleteItem = useCallback(
    (id) =>
      runExclusive(async () => {
        setStatusSafe('saving')
        bumpPending(1)
        setItems((prev) => prev.filter((item) => item.id !== id))
        try {
          const { error: deleteError } = await supabase
            .from('items')
            .delete()
            .eq('id', id)
          if (deleteError) throw deleteError
          setStatusSafe('saved')
        } catch {
          setStatusSafe('error')
          await load()
        } finally {
          bumpPending(-1)
        }
      }),
    [bumpPending, load, runExclusive, setStatusSafe],
  )

  const clearError = useCallback(() => setError(''), [])

  const seedDefaultList = useCallback(
    ({ skipExistingCategories = false } = {}) =>
      runExclusive(async () => {
        setError('')
        setStatusSafe('saving')

        const createdCategoryIds = []
        const createdItemIds = []
        const existingNames = new Set(
          categories.map((category) => category.name.trim().toLowerCase()),
        )

        const categoriesToSeed = skipExistingCategories
          ? DEFAULT_LIST.filter(
              (category) => !existingNames.has(category.name.trim().toLowerCase()),
            )
          : DEFAULT_LIST

        if (categoriesToSeed.length === 0) {
          setStatusSafe('saved')
          setSeedProgress(null)
          return { added: 0, skipped: true }
        }

        const total = categoriesToSeed.reduce(
          (sum, category) => sum + 1 + category.items.length,
          0,
        )
        let current = 0

        const updateProgress = (label) => {
          current += 1
          if (mountedRef.current) {
            setSeedProgress({ current, total, label })
          }
        }

        let nextCategorySort =
          categories.reduce(
            (max, category) => Math.max(max, category.sort_order || 0),
            0,
          ) + 1

        try {
          for (const categoryDef of categoriesToSeed) {
            updateProgress(categoryDef.name)

            const { data: categoryRow, error: categoryError } = await supabase
              .from('categories')
              .insert({
                name: categoryDef.name,
                sort_order: nextCategorySort,
              })
              .select()
              .single()

            if (categoryError) throw categoryError
            createdCategoryIds.push(categoryRow.id)
            nextCategorySort += 1

            const itemRows = categoryDef.items.map((itemName, index) => ({
              category_id: categoryRow.id,
              name: itemName,
              purchased: false,
              brand: '',
              model: '',
              price: 0,
              down_payment: 0,
              installments: 0,
              paid_installments: 0,
              note: '',
              start_month: currentMonth(),
              sort_order: index + 1,
            }))

            for (const itemRow of itemRows) {
              updateProgress(itemRow.name)
              const { data: insertedItem, error: itemError } = await supabase
                .from('items')
                .insert(itemRow)
                .select('id')
                .single()
              if (itemError) throw itemError
              createdItemIds.push(insertedItem.id)
            }
          }

          await load()
          setStatusSafe('saved')
          setSeedProgress(null)
          return {
            added: createdCategoryIds.length,
            skipped: false,
            totalSteps: total,
          }
        } catch (err) {
          if (createdItemIds.length > 0) {
            await supabase.from('items').delete().in('id', createdItemIds)
          }
          if (createdCategoryIds.length > 0) {
            await supabase
              .from('categories')
              .delete()
              .in('id', createdCategoryIds)
          }
          await load()
          setStatusSafe('error')
          setSeedProgress(null)
          setError(
            translateDbError(
              err,
              'Hazır liste yüklenemedi. Yarım kalan kayıtlar temizlendi; tekrar deneyebilirsiniz.',
            ),
          )
          return null
        }
      }),
    [categories, load, runExclusive, setStatusSafe],
  )

  return {
    categories,
    items,
    loading,
    error,
    saveStatus,
    busy,
    seedProgress,
    reload: load,
    clearError,
    addCategory,
    renameCategory,
    deleteCategory,
    addItem,
    updateItem,
    deleteItem,
    seedDefaultList,
  }
}

function translateDbError(err, fallback) {
  const message = (err?.message || '').toLowerCase()
  const code = err?.code
  if (
    code === '42501' ||
    message.includes('row-level security') ||
    message.includes('violates row-level security')
  ) {
    return 'Kayıt izni yok. Supabase SQL Editor’de supabase/migrations/002_grants_authenticated.sql dosyasını çalıştırın.'
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
  }
  return err?.message || fallback
}
