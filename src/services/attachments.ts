import { client } from './api'
import type { Attachment } from '@/types'

export async function listAttachments(ticketId: string): Promise<Attachment[]> {
  const { data } = await client.get(`/tickets/${ticketId}/attachments`)
  return data
}

export async function uploadAttachment(ticketId: string, file: File): Promise<Attachment> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post(`/tickets/${ticketId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}
