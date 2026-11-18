import { useEffect, useState } from 'react'
import ConfigError from './components/ConfigError'
import LoginForm from './components/LoginForm'
import Home from './components/Home'
import { isSupabaseConfigured, supabase } from './lib/supabase'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return undefined

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (!isSupabaseConfigured) {
    return <ConfigError />
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center text-zinc-400 text-base">
        Yükleniyor…
      </div>
    )
  }

  if (session?.user) {
    return <Home />
  }

  return <LoginForm />
}
