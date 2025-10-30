import { useEffect, useState } from 'react'
import { myTickets } from '@/services/tickets'
import type { Ticket } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

export default function MyTickets() {
  const { user } = useAuth()
  const [rows, setRows] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if (!user) return
    setLoading(true)
    myTickets(user).then(setRows).finally(()=>setLoading(false))
  }, [user])

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Mis tickets</h3>
      <div style={{overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Asunto</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Modulo</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t=>(
              <tr key={t.id}>
                <td><Link to={`/tickets/${t.id}`}>{t.id}</Link></td>
                <td>{t.subject}</td>
                <td><span className="pill">{t.priority}</span></td>
                <td><span className={`pill status-${t.status}`}>{t.status}</span></td>
                <td><span className="pill">{t.moduleCode}</span></td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && !loading && <tr><td className="muted" colSpan={5}>Aún no has creado tickets</td></tr>}
          </tbody>
        </table>
        {loading && <div className="muted">Cargando...</div>}
      </div>
    </div>
  )
}
