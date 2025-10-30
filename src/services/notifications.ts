import { client } from './api'
import type { NotificationFeed } from '@/types'

export async function fetchNotifications(): Promise<NotificationFeed> {
  const { data } = await client.get(`/notifications`)
  return data
}

export async function markNotificationRead(id: string): Promise<void> {
  await client.post(`/notifications/${id}/read`)
}
