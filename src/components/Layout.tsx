import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { fetchMenu } from '@/services/admin'
import { fetchNotifications } from '@/services/notifications'
import type { MenuItem, NotificationFeed } from '@/types'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const isAgent = !!user?.flgAtencion

  const [menu, setMenu] = useState<MenuItem[]>([
    { label: 'Crear ticket', path: '/home' },
    { label: 'Mis tickets', path: '/mis-tickets' },
    ...(isAgent ? [{ label: 'Bandeja agente', path: '/bandeja-agente' }] : [])
  ])
  const [notif, setNotif] = useState<NotificationFeed>({ items: [], unread: 0 })

  // useEffect(() => {
  //   fetchMenu().then(m => {
  //     if (Array.isArray(m) && m.length) setMenu(m)
  //   }).catch(()=>{})
  //   fetchNotifications().then(setNotif).catch(()=>{})
  // }, [])

  return (
    <div className="layout">
      <aside className="sidebar">
        <h3 style={{marginTop:0}}>CIPSA Tickets</h3>
        <div className="menu">
          {menu.map(mi => (
            <NavLink key={mi.path} to={mi.path} className={({isActive})=>isActive?'active':''}>
              {mi.label}
            </NavLink>
          ))}
        </div>
      </aside>

      <div className="main">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn ghost" title="Notificaciones">
              <span role="img" aria-label="bell">🔔</span>
              {notif.unread > 0 && <span className="badge red">{notif.unread}</span>}
            </button>
            <div>
              <strong>{user?.nombreCompleto}</strong>
              <div className="muted">{user?.username}{isAgent?' • Agente':''}</div>
            </div>
          </div>
          <button className="btn ghost" onClick={logout}>Cerrar sesión</button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
