import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {
  checkIfReady,
  filterOutRoles,
} from '../utilities/helpers.jsx';
import {
  createGame,
  deleteGame,
  fetchGame,
  fetchGames,
  updateGame,
} from '../utilities/supabaseCalls.jsx'

const roleOptions = [
  'fox',
  'wolf',
  'pigeon',
  'turtle'
];

export default function Lobby() {
  const navigate = useNavigate();
  const chosenRole = localStorage.getItem('role');
  const chosenGame = localStorage.getItem('gameName');
  const [gameName, setGameName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [games, setGames] = useState([]);
  const [createModalVis, setCreateModalVis] = useState(false);
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');

  console.log('game name and role ', typeof chosenGame, chosenRole != null);

  useEffect(() => {
    fetchGames(setGames);

    const interval = setInterval(() => fetchGames(setGames), 3000)

    return () => clearInterval(interval)
  }, []);

  const closeCreateModal = () => {
    setGameName('');
    setSelectedRole(null);
    setCreateModalVis(false);
    setCreateError('');
  };
  const gamesListDisplay = games.map((game) => {
    if (chosenGame !== null && chosenGame !== game.name) {
      return null;
    }
    const remainingRoles = filterOutRoles(game, roleOptions);
    const joinButtons = remainingRoles.map((role) => {
      return (
        <div key={role}>
          <button onClick={async () => {
            const newGameData = { [role]: true };
            const joinResult = await updateGame(game, newGameData);
            console.log("join result ", joinResult);
            if (Array.isArray(joinResult)) {
              localStorage.setItem('role', role);
              localStorage.setItem('gameName', game.name);
              setJoinError('');
              const newGameData = await fetchGame(game.name);
              if (checkIfReady(newGameData)) {
                updateGame(game, { readying: true, fox: false, wolf: false, pigeon: false, turtle: false });
              }
            }
            else {
              setJoinError('There was an error joining this game: ',joinResult);
            }
          }}>
            Join Game as {role}
          </button>
        </div>
      );
    });
    const enterButton = (
      <button
        disabled={!game.readying}
        onClick={() => navigate(`/game/${game.name}`)}
      >
        Enter Game
      </button>
    );
    return (
      <div key={game.name}>
        <Accordion>
          <AccordionSummary
            id={`game${game.name}-header`}
          >
            <div>Game {game.name}</div>
          </AccordionSummary>
          <AccordionDetails>
            {chosenRole === null ? joinButtons : enterButton}
            <button onClick={() => updateGame(game, { fox: false, wolf: false, pigeon: false, turtle: false, readying: false })}>
              Reset Agents
            </button>
            <button onClick={() => deleteGame(game.name)}>
              Delete Game
            </button>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  });

  const createModal = (
    <Modal
      isOpen={createModalVis}
      onRequestClose={closeCreateModal}
      contentLabel="create modal"
    >
      <h2>Create a game</h2>
      <p>{createError}</p>
      <button onClick={closeCreateModal}>close</button>
      <form>
        <input
          placeholder="game title"
          value={gameName}
          onChange={e => setGameName(e.target.value)}
        />
        <InputLabel >Select an Agent</InputLabel>
        <Select
          value={selectedRole}
          label="Select an Agent"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roleOptions.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </Select>
        <button
          disabled={gameName.length < 1 || selectedRole == null}
          onClick={async () => {
            const createResult = await createGame({ name: gameName, [selectedRole]: true });
            console.log('create game result', createResult);
            if(createResult.name !== null) {
              localStorage.setItem('role', selectedRole);
              localStorage.setItem('gameName', gameName);
              closeCreateModal();
            }
            else {
              setCreateError('There was an error creating your game? ', createResult);
            }
          }}
        >
          Create Game
        </button>
      </form>
    </Modal>
  );  

  return (
    <>
      <h1>Babble! at the Disco</h1>
      <div>
        <p>Welcome! You are about to embark on a game of abstruse assembling, blundered building, and confused construction.</p>
        <p>It`s as easy as ABC</p>
        <p>A game can only be played with exactly 4 players. You must be in the same place, with the game`s blocks in the center of a table.</p>
        <p>To begin, click Create Game. Give it a name, and choose your Agent animal codename (don`t overthink it).</p>
        <p>Have the other 3 people join your game and choose their role.</p>
        <p>Once the game is filled, you will be able to play!</p>
      </div>
      <p>{joinError}</p>
      {gamesListDisplay}

      <br />
      <br />

      <button
        disabled={chosenGame!==null && chosenRole!==null}
        onClick={() => setCreateModalVis(true)}
      >
        Create Game
      </button>

      <br />
      <br />

      <button
        onClick={() => {
          localStorage.removeItem('role');
          localStorage.removeItem('gameName');
        }}
      >
        Something has gone horribly wrong! Reset my browser, please.
      </button>

      {createModal}
    </>
  )
}