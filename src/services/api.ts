import axios from 'axios'
import type { User } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Lazy import mock to avoid bundling when not used
let mock: any = null
if (USE_MOCK) {
  // @ts-ignore
  mock = await import('@/mock/mockServer').then(m => m.mock)
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000
})

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('auth_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
      // window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const api = {
  async login(username: string, password: string) {
    if (USE_MOCK) return mock.login(username, password)
    const res = await client.post('/auth/login', { username, password })
    const token: string | undefined = res.data?.token || res.data?.access_token
    const user: User | undefined = res.data?.user

    if (!token) throw new Error('Respuesta de login inválida: falta token')
    sessionStorage.setItem('auth_token', token)

    if (!user) {
      // Intento opcional de /auth/me, si existe
      try {
        const me = await client.get('/auth/me')
        const userMe: User = me.data
        userMe.roles = ['admin'] 
        sessionStorage.setItem('auth_user', JSON.stringify(userMe))
        return { token, user: userMe }
      } catch {
        throw new Error('Respuesta de login inválida: falta user (ajusta backend para devolver { token, user } o expón /auth/me)')
      }
    } else {
      sessionStorage.setItem('auth_user', JSON.stringify(user))
      return { token, user }
    }
  },

  async logout() {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
  }
}

export { client }
