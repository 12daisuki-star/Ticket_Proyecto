import { client } from './api'
import type { Note } from '@/types'

export async function listNotes(ticketId: string): Promise<Note[]> {    
  const { data } = await client.get(`/tickets/${ticketId}/notes`)
  return data
}

export async function addNote(ticketId: string, userId: string, note: string): Promise<Note> {
  const { data } = await client.post(`/tickets/${ticketId}/notes`, { note })
  return data
}