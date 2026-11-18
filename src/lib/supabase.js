import { createClient } from '@supabase/supabase-js'

const REMEMBER_KEY = 'ceyiz-hatirla'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl?.trim() && supabaseAnonKey?.trim(),
)

export function getRememberMe() {
  return localStorage.getItem(REMEMBER_KEY) !== 'false'
}

export function setRememberMe(value) {
  localStorage.setItem(REMEMBER_KEY, value ? 'true' : 'false')
}

function activeStorage() {
  return getRememberMe() ? localStorage : sessionStorage
}

const authStorage = {
  getItem(key) {
    return activeStorage().getItem(key)
  },
  setItem(key, value) {
    const preferred = activeStorage()
    const other = preferred === localStorage ? sessionStorage : localStorage
    other.removeItem(key)
    preferred.setItem(key, value)
  },
  removeItem(key) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export function translateAuthError(error) {
  const message = (error?.message || '').toLowerCase()

  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials')
  ) {
    return 'Yanlış e-posta veya şifre.'
  }
  if (message.includes('email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış.'
  }
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin.'
  }
  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('fetch')
  ) {
    return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
  }

  return 'Giriş yapılamadı. Lütfen tekrar deneyin.'
}
