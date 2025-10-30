
# CIPSA React Tickets (Extended)
Pantallas añadidas:
- **Mis tickets** (solicitante)
- **Detalle de ticket** (compartida solicitante/agente)
- **Bandeja del agente con filtros y paginación**
- **Layout** con menú dinámico por rol

## Ejecutar (demo con mock)
```bash
npm i
npm run dev
```
La demo usa `VITE_USE_MOCK=true`. Ingresa con:
- Usuario solicitante: **user / 123456**
- Agente de soporte: **agente / 123456**

## Integración real
- Establece `VITE_API_BASE_URL` y `VITE_USE_MOCK=false` en `.env`
- Endpoints esperados: `/auth/login`, `/auth/me`, `/tickets`, `/tickets/mine`, `/tickets/assigned`, `/tickets/:id`, `/tickets/:id/status`, `/tickets/:id/notes`
