# CIPSA Tickets – Enhanced

Mejoras aplicadas:
- Timeout Axios reducido a **60s** y manejo de 401 robusto.
- Login ahora exige `{ token, user }` (con fallback opcional a `/auth/me`).
- Nuevo **Layout** con menú dinámico desde `/menu` y campana de **notificaciones**.
- Nuevos **servicios**: `notes.ts`, `attachments.ts`, `notifications.ts`, `admin.ts`.
- Nueva página **/bandeja-agente** (Kanban simple por estado).
- `TicketDetail` extendido con **Notas** y **Adjuntos** (mínimo).
- Tipos centralizados y extendidos (`Notification`, `MenuItem`, etc.).
- Mock renovado (DB v2) con endpoints para notas, adjuntos, notificaciones y menú.

## Variables de entorno
```
VITE_API_BASE_URL=http://localhost:5080
VITE_USE_MOCK=false
```

Para usar mock (credenciales: `user/123456`, `agente/123456`, `admin/123456`):
```
VITE_USE_MOCK=true
```

## Rutas añadidas
- `/bandeja-agente` (agentes)

## Scripts
- `npm i`
- `npm run dev`

## Contratos Backend esperados (resumen)
- `POST /auth/login` → `{ token, user }` (recomendado)
- `GET /auth/me` → `User` (opcional)
- `GET /menu` → `MenuItem[]`
- `GET /notifications` → `NotificationFeed`
- `GET /tickets/mine`
- `GET /tickets/assigned`
- `GET /tickets/:id`
- `PUT /tickets/:id/status`
- `PUT /tickets/:id/priority`
- `PUT /tickets/:id/assignee`
- `GET/POST /tickets/:id/notes`
- `GET/POST /tickets/:id/attachments`
