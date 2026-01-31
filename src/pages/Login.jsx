import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function Login() {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  function submit(e) {
    e.preventDefault()
    if (!name) return;
    localStorage.setItem('name', name);

    const { data: player } = await supabase
      .from('players')
      .select()
      .eq('name', name)
      .single();

    console.log("here's the player: ", player);
    if (player!==null) {
      await supabase.from('players').insert({
        name,
        game_id: game.id
      });
    }
    navigate('/lobby');
  }

  return (
    <form onSubmit={submit}>
      <h1>Enter your name</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
      />
      <button>Enter</button>
    </form>
  )
}