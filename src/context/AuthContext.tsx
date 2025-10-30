
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@/types'
import { api } from '@/services/api'

type AuthCtx = {
  token: string | null,
  user: User | null,
  login: (username: string, password: string) => Promise<void>,
  logout: () => void
}

const Ctx = createContext<AuthCtx>({} as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string|null>(() => sessionStorage.getItem('auth_token'))
  const [user, setUser] = useState<User|null>(() => {
    const raw = sessionStorage.getItem('auth_user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        setToken(sessionStorage.getItem('auth_token'))
        const raw = sessionStorage.getItem('auth_user')
        setUser(raw ? JSON.parse(raw) : null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  async function login(username: string, password: string) {
    const res = await api.login(username, password)
    sessionStorage.setItem('auth_token', res.token)
    sessionStorage.setItem('auth_user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }

  function logout() {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    setToken(null); setUser(null)
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() { return useContext(Ctx) }
