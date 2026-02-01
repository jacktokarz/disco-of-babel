import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import Lobby from './pages/Lobby'
import Game from './pages/Game'

export default function App() {
  console.log(
    'key log: ',
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 6)
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lobby" />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="/game/:name" element={<Game />} />
    </Routes>
  )
}
