
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import MyTickets from './pages/MyTickets'
import TicketDetail from './pages/TicketDetail'
import AgentBoard from './pages/AgentBoard'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/Layout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/mis-tickets" element={<MyTickets />} />
        <Route path="/bandeja-agente" element={<AgentBoard />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
