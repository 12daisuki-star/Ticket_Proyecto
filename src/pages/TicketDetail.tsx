import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTicket, updateTicketStatus } from '@/services/tickets'
import { addNote, listNotes } from '@/services/notes'
import type { Note, Ticket } from '@/types' 
import { useAuth } from '@/context/AuthContext'
import type { Attachment } from '@/types';
import { listAttachments, downloadAttachment } from '@/services/attachments';



export default function TicketDetail() {
  const { id } = useParams<{id:string}>()
  const { user } = useAuth()
  const isAgent = !!user?.flgAtencion

  const [t, setT] = useState<Ticket|null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [msg, setMsg] = useState<string|null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingNote, setSendingNote] = useState(false)
  // dentro del componente:
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attLoading, setAttLoading] = useState(false);

  // utilidad para tamaño legible
  function formatBytes(b: number) {
    if (!b) return '0 B';
    const k = 1024, sizes = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  }

  async function load() {
    if (!id) return;
    setLoading(true); 
    setMsg(null);
    try {
      const tk = await getTicket(id);
      setT(tk);
      const ns = await listNotes(id);
      setNotes(ns);

      setAttLoading(true);
      const atts = await listAttachments(id);      
      setAttachments(atts);
    } catch (err:any) {
      setMsg(err?.message || 'No se pudo cargar el ticket');
    } finally {
      setAttLoading(false);
      setLoading(false);
    }
  }

  useEffect(()=>{ load()/* eslint-disable-line */ }, [id])

  async function onAddNote() {
    if (!user || !id || !note.trim()) return
    setSendingNote(true)
    setMsg(null)

    // Optimistic UI
    try {
      const n = await addNote(id, String(user.id), note.trim())
      setNotes(prev => [...prev, n])
      setNote('')
    } catch (err:any) {
      setMsg(err?.message || 'No se pudo agregar la nota')
    } finally {
      setSendingNote(false)
    }
  }

  async function onChangeStatus(s: Ticket['status']) {
    if (!id || !t || !isAgent) return
    setMsg(null)
    const prev = t
    setT({ ...t, status: s })
    try {
      await updateTicketStatus(id, s, String(user!.id))
      setMsg('Estado actualizado')
    } catch (err:any) {
      setT(prev)
      setMsg(err?.message || 'No se pudo actualizar el estado')
    }
  }

  if (loading && !t) return <div className="muted">Cargando ticket...</div>
  if (!t) return <div className="muted">No se encontró el ticket</div>

  return (
    <div className="grid" style={{gap:'1rem'}}>
      <div className="card">
        <h3 style={{marginTop:0}}>
          Ticket {t.id} • <span className={`pill status-${t.status}`}>{t.status.replace('_',' ')}</span>
        </h3>
        <div className="grid grid-2">
          <div>
            <div className="muted">Asunto</div>
            <div><strong>{t.subject}</strong></div>
          </div>
          <div>
            <div className="muted">Prioridad</div>
            <div><span className="pill">{t.priority}</span></div>
          </div>
          <div>
            <div className="muted">Módulo</div>
            <div><span className="pill">{t.moduleCode}</span></div>
          </div>
          <div style={{gridColumn:'1 / -1'}}>
            <div className="muted">Descripción</div>
            <p>{t.description}</p>
          </div>
        </div>

        {isAgent && (
          <div className="chips" style={{marginTop:'.5rem'}}>
            <button className="btn" onClick={()=>onChangeStatus('en_atencion')}>Tomar</button>
            <button className="btn" onClick={()=>onChangeStatus('pausado')}>Pausar</button>
            <button className="btn" onClick={()=>onChangeStatus('resuelto')}>Resolver</button>
            <button className="btn" onClick={()=>{ if(confirm('¿Finalizar ticket?')) onChangeStatus('finalizado') }}>Finalizar</button>
          </div>
        )}
        {msg && <div className="muted" role="status" style={{marginTop:'.5rem'}}>{msg}</div>}
      </div>

      <div className="card">
        <h3 style={{marginTop:0}}>Archivos</h3>

        {attLoading && <div className="muted">Cargando archivos…</div>}

        {!attLoading && attachments.length === 0 && (
          <div className="muted">No hay archivos adjuntos</div>
        )}

        {!attLoading && attachments.length > 0 && (
          <ul style={{margin:0, paddingLeft:'1.2rem'}}>
            {attachments.map(a => (
              <li key={a.id} style={{marginBottom:'.35rem'}}>
                <div style={{display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap'}}>
                  {/* ❌ <a href={getAttachmentDownloadUrl(a.id)} ...> */}
                  {/* ✅ Botón que descarga con Authorization via XHR */}
                  <button
                    className="link"
                    title={`Descargar ${a.fileName}`}
                    onClick={() => downloadAttachment(a.id, a.fileName)}
                  >
                    {a.fileName}
                  </button>

                  {typeof a.size === 'number' && <span className="muted">• {formatBytes(a.size)}</span>}
                  {typeof a.CreatedAt === 'string' && <span className="muted">• {new Date(a.CreatedAt).toLocaleString()}</span>}
                  {a.contentType && <span className="pill">{a.contentType}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>


      <div className="card">
        <h3 style={{marginTop:0}}>Notas</h3>
        <div className="grid" style={{gap:'.6rem'}}>
          {notes.length > 0 ? notes.map(n=> (
            <div key={n.id} style={{borderLeft:'3px solid #eee', paddingLeft:'.6rem'}}>
              <div className="muted">{new Date(n.createdAt).toLocaleString()}</div>
              <div>{n.note}</div>
            </div>
          )) : <div className="muted">Sin notas aún</div>}

          <div className="grid" style={{gridTemplateColumns:'1fr auto', gap:'.5rem'}}>
            <input
              placeholder="Escribe una nota..."
              value={note}
              onChange={e=>setNote(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); onAddNote(); } }}
            />
            <button className="btn primary" onClick={onAddNote} disabled={sendingNote || !note.trim()}>
              {sendingNote ? 'Agregando…' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
