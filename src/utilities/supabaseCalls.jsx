import { supabase } from '../supabase';

export async function createGame(gameData) {
  console.log('inserting ', gameData);
  const { error } = await supabase
    .from('games')
    .insert(gameData);

  console.log('insert result', error);
  return error;
}

export async function deleteGame(name) {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('name', name);

  console.log('delete result', error);
  return error;
}

export async function fetchGames(setGames) {
  if (document.hidden) return;
  const { data } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })

  setGames(data);
}

export async function fetchGame(name) {
  if (document.hidden) return;
  const { data } = await supabase
    .from('games')
    .select()
    .eq('name', name);

  return data[0];
}

export async function updateGame(gameData, newGameData) {
  console.log('updating game with: ', gameData.name, newGameData);
  const { data: game, error } = await supabase
    .from('games')
    .update(newGameData)
    .eq('name', gameData.name)
    .select();

  return error || game;
}