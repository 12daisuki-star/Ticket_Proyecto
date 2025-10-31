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

export function getAttachmentDownloadUrl(attachmentId: string) {
  // Si el cliente (axios) ya tiene baseURL configurado, basta con esto:
  return `${client.defaults.baseURL}/tickets/attachments/${attachmentId}`
}

export async function downloadAttachment(attachmentId: string, name: string) {
  const response = await client.get(`/attachments/${attachmentId}`, {
    responseType: 'blob',
  });
  
  const blob = response.data;
  const url = window.URL.createObjectURL(blob);

  // 1️⃣ Obtener nombre del header Content-Disposition  
  let fileName = name;
  // 2️⃣ Si el nombre no tiene extensión, intentar deducirla por Content-Type
  if (!fileName.includes('.')) {
    const contentType = response.headers['content-type'];
    const extension = getExtensionFromContentType(contentType);
    fileName += extension ? `.${extension}` : '';
  }

  // 3️⃣ Descargar
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// 🔧 Auxiliar: Mapea MIME -> extensión
function getExtensionFromContentType(type?: string): string | undefined {
  if (!type) return;
  const map: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'text/plain': 'txt',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/zip': 'zip',
  };
  return map[type] || undefined;
}

