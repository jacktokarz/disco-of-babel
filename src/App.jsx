import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import Game from './pages/Game'

export default function App() {
  const name = localStorage.getItem('name');
  console.log(
    'key log: ',
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 6)
  );

  return (
    <Routes>
      <Route path="/" element={name ? <Navigate to="/lobby" /> : <Login />} />
      <Route path="/lobby" element={name ? <Lobby /> : <Navigate to="/" />} />
      <Route path="/game/:id" element={<Game />} />
    </Routes>
  )
}
