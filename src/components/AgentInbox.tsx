// src/components/AgentInbox.tsx
import { useEffect, useMemo, useState } from 'react';
import type { Priority, Status, Ticket } from '@/types';
import { listAssignedTickets, updateTicketStatus, updateTicketPriority } from '@/services/tickets';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const STATUSES: Status[] = ['nuevo', 'en_atencion', 'pausado', 'resuelto', 'finalizado'];
const PRIORITIES: Priority[] = ['baja', 'media', 'alta', 'critica'];

type Query = {
  estado: '' | Status;
  prioridad: '' | Priority;
  search: string;
  page: number;
  pageSize: number;
};

export default function AgentInbox() {
  const { user } = useAuth();
  const [query, setQuery] = useState<Query>({
    estado: '',
    prioridad: '',
    search: '',
    page: 1,
    pageSize: 5,
  });

  const [rows, setRows] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / query.pageSize)),
    [total, query.pageSize]
  );

  async function load() {
    setLoading(true);
    try {
      const { items, total: t } = await listAssignedTickets({
        estado: query.estado || undefined,
        prioridad: query.prioridad || undefined,
        q: query.search || undefined,
        page: query.page,
        pageSize: query.pageSize,
        agenteId: user?.id,
      });
      setRows(items);
      setTotal(t ?? items.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.estado, query.prioridad, query.search, query.page, query.pageSize]);

  async function onChangeStatus(id: string, estado: Status) {
    await updateTicketStatus(id, estado, user?.id);
    load();
  }

  async function onChangePriority(id: string, prioridad: Priority) {
    await updateTicketPriority(id, prioridad);
    load();
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Bandeja del agente</h3>

      {/* Filtros */}
      <div className="grid" style={{ gap: '.5rem', gridTemplateColumns: '1fr 180px 180px 140px' }}>
        <input
          placeholder="Buscar por asunto o descripción"
          value={query.search}
          onChange={(e) => setQuery({ ...query, page: 1, search: e.target.value })}
        />
        <select
          value={query.estado}
          onChange={(e) => setQuery({ ...query, page: 1, estado: (e.target.value || '') as Query['estado'] })}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={query.prioridad}
          onChange={(e) => setQuery({ ...query, page: 1, prioridad: (e.target.value || '') as Query['prioridad'] })}
        >
          <option value="">Todas las prioridades</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={query.pageSize}
          onChange={(e) => setQuery({ ...query, page: 1, pageSize: Number(e.target.value) })}
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>{n} por página</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div style={{ marginTop: '.75rem', overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Asunto</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Actualizado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tickets/${t.id}`}>{t.subject}</Link>
                  <div className="muted" style={{ fontSize: 12 }}>{t.description}</div>
                </td>
                <td>
                  <select value={t.priority} onChange={(e) => onChangePriority(t.id, e.target.value as Priority)}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td>
                  <select value={t.status} onChange={(e) => onChangeStatus(t.id, e.target.value as Status)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td><span className="muted">{new Date(t.createdAt).toLocaleString()}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <Link className="btn ghost" to={`/tickets/${t.id}`}>Abrir</Link>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td colSpan={5} className="muted">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
        {loading && <div className="muted">Cargando...</div>}
      </div>

      {/* Paginación */}
      <div className="right" style={{ marginTop: '.75rem' }}>
        <button className="btn" disabled={query.page <= 1}
          onClick={() => setQuery({ ...query, page: Math.max(1, query.page - 1) })}>
          Anterior
        </button>{' '}
        <span className="muted">Página {query.page} de {pages}</span>{' '}
        <button className="btn" disabled={query.page >= pages}
          onClick={() => setQuery({ ...query, page: Math.min(pages, query.page + 1) })}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
