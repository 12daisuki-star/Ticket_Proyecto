import { client } from './api'

export async function fetchMenu() {
  const { data } = await client.get('/menu')
  return data
}
