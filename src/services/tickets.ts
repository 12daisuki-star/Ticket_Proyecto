import { client } from './api';
import type { Ticket, Priority, Status, ModuleCode } from '@/types';

type ListParams = {
  estado?: Status;
  prioridad?: Priority;
  q?: string;
  page?: number;
  pageSize?: number;
  agenteId?: string;
};

export async function listAssignedTickets(params: ListParams = {}): Promise<{ items: Ticket[]; total?: number }> {
  const { data } = await client.get('/tickets/assigned', { params });
  return { items: data , total: data.length };
}

export async function createTicket(payload: Partial<Ticket> & { asunto: string; descripcion: string; prioridad: Priority; moduleCode: ModuleCode; creadorId?: string }, onProgress?: (percent: number) => void) {  
  if (payload.files && payload.files.length > 0) {
    const fd = new FormData()
    fd.append('subject', payload.asunto)
    fd.append('description', payload.descripcion)
    fd.append('priority', payload.prioridad)
    fd.append('moduleCode', payload.moduleCode)
    payload.files.forEach((f) => fd.append('files', f, f.name))
    //res = await client.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    const { data } = await client.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data as Ticket;
  } else {
    const { data } = await client.post('/tickets', payload)
    return data as Ticket;
  }
  // const { data } = await client.post('/tickets', payload);
  // return data as Ticket;
}

export async function updateTicketStatus(id: string, estado: Status, userId?: string) {
  await client.put(`/tickets/${id}/status`, { estado, userId });
}

export async function updateTicketPriority(id: string, prioridad: Priority) {
  await client.put(`/tickets/${id}/priority`, { prioridad });
}

export async function myTickets(params: any = {}): Promise<Ticket[]> {
  const { data } = await client.get('/tickets/mine', { params })
  return data
}

// export async function listAssignedTickets(params: any = {}): Promise<{ items: Ticket[], total?: number }> {
//   const { data } = await client.get('/tickets/assigned', { params })
//   return data
// }

export async function getTicket(id: string): Promise<Ticket> {
  const { data } = await client.get(`/tickets/${id}`)
  return data
}

// export async function createTicket(payload: Partial<Ticket>): Promise<Ticket> {
//   const { data } = await client.post('/tickets', payload)
//   return data
// }

// export async function updateTicketStatus(id: string, estado: Status, userId?: string): Promise<void> {
//   await client.put(`/tickets/${id}/status`, { estado })
// }

// export async function updateTicketPriority(id: string, prioridad: Priority): Promise<void> {
//   await client.put(`/tickets/${id}/priority`, { prioridad })
// }

export async function reassignTicket(id: string, userId: string): Promise<void> {
  await client.put(`/tickets/${id}/assignee`, { userId })
}