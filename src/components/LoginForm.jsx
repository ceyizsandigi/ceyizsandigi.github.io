import { useState } from 'react'
import {
  getRememberMe,
  setRememberMe,
  supabase,
  translateAuthError,
} from '../lib/supabase'
import { APP_NAME, APP_TAGLINE } from '../lib/brand'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(getRememberMe())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    setRememberMe(remember)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(translateAuthError(signInError))
      }
    } catch (err) {
      setError(translateAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-black px-4 py-10 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5"
      >
        <div className="space-y-3">
          <img
            src={`${import.meta.env.BASE_URL}icon.svg`}
            alt=""
            className="size-14 rounded-2xl border border-zinc-700"
          />
          <div>
            <h1 className="text-2xl font-semibold text-white">{APP_NAME}</h1>
            <p className="mt-1 text-zinc-400 text-base">{APP_TAGLINE}</p>
            <p className="mt-3 text-zinc-500 text-sm">Hesabınıza giriş yapın</p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">E-posta</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-12 rounded-xl bg-zinc-950 border border-zinc-700 px-4 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="ornek@mail.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">Şifre</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-12 rounded-xl bg-zinc-950 border border-zinc-700 px-4 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            placeholder="Şifreniz"
          />
        </label>

        <label className="flex items-center gap-3 min-h-12 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="size-5 rounded border-zinc-600 bg-zinc-950 accent-white"
          />
          <span className="text-base text-zinc-200">Beni hatırla</span>
        </label>

        {error ? (
          <p className="rounded-xl bg-red-950/60 border border-red-900 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-xl bg-white text-black text-base font-medium disabled:opacity-60"
        >
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
    </div>
  )
}
