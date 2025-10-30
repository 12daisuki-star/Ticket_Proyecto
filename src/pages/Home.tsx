
import TicketCreateForm from '@/components/TicketCreateForm'
import AgentInbox from '@/components/AgentInbox'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const isAgent = !!user?.flgAtencion
  return (
    <div className="grid" style={{gap:'1rem'}}>
      <TicketCreateForm />
      {isAgent && <AgentInbox />}
    </div>
  )
}
