import React from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Lobby() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')
  const [gameName, setGameName] = useState('');
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
    const { data: game } = await supabase
      .from('games')
      .insert({ name: gameName })
      .select()
      .single();

    await supabase.from('players').insert({
      name,
      game_id: game.id
    });

    navigate(`/game/${game.id}`)
  }

  async function joinGame(gameId) {
    const { data: game } = await supabase
      .from('games')
      .select()
      .eq('id', gameId)
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

  const gamesListDisplay = games.map((game) => {
    return (
      <div key="1">
        <h2>Game {game.id}</h2>
        <button onClick={() => joinGame(game.id)}>Join Game</button>
      </div>
    );
  });

  return (
    <>
      <h1>Lobby</h1>
      <h2>Make a game</h2>
      <input
        placeholder="Game name"
        value={gameName}
        onChange={e => setGameName(e.target.value)}
      />
      <button disabled={gameName.length < 1} onClick={createGame}>Create Game</button>

      <hr />

      {gamesListDisplay}
    </>
  )
}