import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Lobby() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')
  const [code, setCode] = useState('');
  const [games, setGames] = useState([]);


  async function fetchGames() {
    if (document.hidden) return;
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })

    setGames(data || [])
  }

  async function createGame() {
    const gameCode = Math.random().toString(36).substring(2, 6).toUpperCase()

    const { data: game } = await supabase
      .from('games')
      .insert({ code: gameCode })
      .select()
      .single()

    await supabase.from('players').insert({
      name,
      game_id: game.id
    })

    navigate(`/game/${game.id}`)
  }

  async function joinGame() {
    const { data: game } = await supabase
      .from('games')
      .select()
      .eq('code', code)
      .single()

    if (!game) return alert('Game not found')

    await supabase.from('players').insert({
      name,
      game_id: game.id
    });

    navigate(`/game/${game.id}`)
  }

  useEffect(() => {
    fetchGames()

    const interval = setInterval(fetchGames, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <h1>Lobby</h1>
      <button onClick={createGame}>Create Game</button>

      <hr />

      <input
        placeholder="Game code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>
    </>
  )
}