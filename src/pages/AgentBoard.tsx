import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext';
import { listAssignedTickets, updateTicketStatus } from '@/services/tickets'
import type { Priority,Ticket, Status } from '@/types'

const COLUMNS: { key: Status; title: string }[] = [
  { key: 'nuevo', title: 'Nuevo' },
  { key: 'en_atencion', title: 'En atención' },
  { key: 'pausado', title: 'Pausado' },
  { key: 'resuelto', title: 'Resuelto' },
  { key: 'finalizado', title: 'Finalizado' }
]

type Query = {
  estado: '' | Status;
  prioridad: '' | Priority;
  search: string;
  page: number;
  pageSize: number;
};

export default function AgentBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth();
  const [query, setQuery] = useState<Query>({
    estado: '',
    prioridad: '',
    search: '',
    page: 1,
    pageSize: 5,
  });

  async function load() {
    setLoading(true)
    try {
      const { items, total } = await listAssignedTickets({
        estado: query.estado || undefined,
        prioridad: query.prioridad || undefined,
        q: query.search || undefined,
        page: query.page,
        pageSize: query.pageSize,
        agenteId: user?.id,
      })
      console.log(items)
      setTickets(items) // soporta array o {items}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function move(t: Ticket, to: Status) {
    if (t.status === to) return
    await updateTicketStatus(t.id, to)
    setTickets(prev => prev.map(x => x.id === t.id ? { ...x, estado: to } : x))
  }

  const byStatus = useMemo(() => {
    const g: Record<Status, Ticket[]> = {nuevo:[], en_atencion:[], pausado:[], resuelto:[], finalizado:[]}
    tickets.forEach(t => { (g[t.status] ||= []).push(t) })
    return g
  }, [tickets])

  return (
    <div>
      <h2>Bandeja del agente</h2>
      {loading && <div className="muted">Cargando...</div>}
      <div className="kanban" style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:16}}>
        {COLUMNS.map(c => (
          <div key={c.key} className="col">
            <h4 style={{marginTop:0}}>{c.title}</h4>
            <div className="stack" style={{display:'grid', gap:8}}>
              {byStatus[c.key]?.map(t => (
                <div key={t.id} className="card" style={{padding:12, border:'1px solid #ddd', borderRadius:12}}>
                  <div style={{fontWeight:600}}>{t.subject}</div>
                  <div className="muted" style={{fontSize:12}}>{t.description}</div>
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    {COLUMNS.filter(x=>x.key!==t.status).map(dst => (
                      <button key={dst.key} className="btn tiny" onClick={()=>move(t, dst.key as Status)}>
                        → {dst.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!byStatus[c.key]?.length && <div className="muted">Sin tickets</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
