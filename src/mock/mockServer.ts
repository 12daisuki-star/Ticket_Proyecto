import type { Ticket, User, Note, Attachment, Status, Priority, NotificationFeed, MenuItem } from '@/types'
import dayjs from 'dayjs'

const DB_KEY = 'cipsa_mock_db_v2'

type DB = {
  users: User[],
  tickets: Ticket[],
  notes: Note[],
  attachments: Attachment[],
  notifications: { [userId: string]: NotificationFeed }
}

function seed(): DB {
  const now = dayjs().toISOString()
  const users: User[] = [
    { id: 'u1', username: 'user', nombreCompleto: 'Usuario Final', flgAtencion: false, roles:['user'] },
    { id: 'a1', username: 'agente', nombreCompleto: 'Agente Soporte', flgAtencion: true, roles:['agent'] },
    { id: 'adm1', username: 'admin', nombreCompleto: 'Administrador', flgAtencion: true, roles:['admin'] }
  ]
  const tickets: Ticket[] = [
    { id: 't1', subject: 'No puedo ingresar', description: 'Error 401 al loguear', priority: 'alta', status: 'nuevo', requesterId:'u1', assigneeId:'a1', createdAt: now, updatedAt: now },
    { id: 't2', subject: 'Lento al cargar', description: 'Dashboard muy lento', priority: 'media', status: 'en_atencion', requesterId:'u1', assigneeId:'a1', createdAt: now, updatedAt: now },
  ]
  const notes: Note[] = []
  const attachments: Attachment[] = []
  const notifications: DB['notifications'] = {
    u1: { items: [{ id:'n1', text:'Ticket t1 recibido', createdAt: now, read:false }], unread: 1 },
    a1: { items: [{ id:'n2', text:'Nuevo ticket asignado t1', createdAt: now, read:false }], unread: 1 },
    adm1: { items: [], unread: 0 }
  }
  return { users, tickets, notes, attachments, notifications }
}

function load(): DB {
  const raw = localStorage.getItem(DB_KEY)
  if (raw) return JSON.parse(raw)
  const db = seed()
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  return db
}

function save(db: DB) { localStorage.setItem(DB_KEY, JSON.stringify(db)) }

function delay(ms=200) { return new Promise(r => setTimeout(r, ms)) }

export const mock = {
  async login(username: string, password: string) {
    await delay()
    const db = load()
    const user = db.users.find(u => u.username === username)
    if (!user || password !== '123456') throw new Error('Credenciales inválidas (use 123456)')
    return { token: 'mock-token-'+user.id, user }
  },

  async myTickets(userId: string) {
    await delay()
    const db = load()
    const items = db.tickets.filter(t => t.assigneeId === userId)
    return { items, total: items.length }
  },

  async assigned(userId: string) {
    await delay()
    const db = load()
    const items = db.tickets.filter(t => t.assigneeId === userId)
    return { items, total: items.length }
  },

  async ticket(id: string) {
    await delay()
    const db = load()
    const t = db.tickets.find(t => t.id === id)
    if (!t) throw new Error('Ticket no encontrado')
    return t
  },

  async createTicket(payload: Partial<Ticket>, userId: string) {
    await delay()
    const db = load()
    const id = 't' + Math.random().toString(36).slice(2,8)
    const now = dayjs().toISOString()
    const t: Ticket = {
      id, subject: payload.subject || 'Sin asunto', description: payload.description || '',
      priority: payload.priority || 'baja', status: 'nuevo',
      requesterId: userId, assigneeId: undefined, createdAt: now, updatedAt: now
    }
    db.tickets.push(t); save(db); return t
  },

  async setStatus(id: string, estado: Status) {
    await delay()
    const db = load()
    const t = db.tickets.find(t => t.id === id); if (!t) throw new Error('No existe')
    t.status = estado; t.updatedAt = dayjs().toISOString(); save(db)
    return t
  },

  async setPriority(id: string, prioridad: Priority) {
    await delay()
    const db = load()
    const t = db.tickets.find(t => t.id === id); if (!t) throw new Error('No existe')
    t.priority = prioridad; t.updatedAt = dayjs().toISOString(); save(db)
    return t
  },

  async reassign(id: string, userId: string) {
    await delay()
    const db = load()
    const t = db.tickets.find(t => t.id === id); if (!t) throw new Error('No existe')
    t.assigneeId = userId; t.updatedAt = dayjs().toISOString(); save(db)
    return t
  },

  async addNote(ticketId: string, authorId: string, message: string) {
    await delay()
    const db = load()
    const note = { id: 'n'+Math.random().toString(36).slice(2,8), ticketId, authorId, message, createdAt: dayjs().toISOString() }
    db.notes.push(note); save(db); return note
  },

  async notes(ticketId: string) {
    await delay()
    const db = load()
    return db.notes.filter(n => n.ticketId === ticketId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))
  },

  async attachments(ticketId: string) {
    await delay()
    const db = load()
    return db.attachments.filter(a => a.ticketId === ticketId)
  },

  async uploadAttachment(ticketId: string, file: File) {
    await delay()
    const db = load()
    const att = {
      id: 'f'+Math.random().toString(36).slice(2,8),
      ticketId,
      name: (file as any).name || 'archivo.dat',
      size: (file as any).size || 0,
      mime: (file as any).type || 'application/octet-stream',
      url: '#'
    }
    db.attachments.push(att); save(db); return att
  },

  async notifications(userId: string) {
    await delay()
    const db = load()
    return db.notifications[userId] || { items: [], unread: 0 }
  },

  async menu(user: User): Promise<MenuItem[]> {
    await delay()
    const common: MenuItem[] = [
      { label:'Crear ticket', path:'/home' },
      { label:'Mis tickets', path:'/mis-tickets' }
    ]
    const agent: MenuItem[] = [{ label:'Bandeja agente', path:'/bandeja-agente' }]
    const admin: MenuItem[] = [{ label:'Reportes', path:'/reportes' }]
    const result = [...common]
    if (user.flgAtencion) result.push(...agent)
    if (user.roles?.includes('admin')) result.push(...admin)
    return result
  }
}
