
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('ycaceres')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const nav = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await login(username, password)
      nav('/home')
    } catch (err:any) {
      setError(err?.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{display:'grid', placeItems:'center', height:'100vh'}}>
      <form className="card" onSubmit={onSubmit} style={{width:360}}>
        <h2 style={{marginTop:0}}>Iniciar sesión</h2>
        <div className="grid" style={{gap:'.6rem'}}>
          <input placeholder="Usuario" value={username} onChange={(e)=>setUsername(e.target.value)} />
          <input placeholder="Contraseña" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {error && <div className="muted" role="alert" aria-live="assertive" style={{color:'#b30c14'}}>{error}</div>}
          <button className="btn primary" disabled={loading}>{loading?'Ingresando...':'Ingresar'}</button>
          <div className="muted">Demo: <strong>user</strong> o <strong>agente</strong> / <strong>123456</strong></div>
        </div>
      </form>
    </div>
  )
}
