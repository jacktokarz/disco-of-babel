import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import { fetchGame, updateGame } from '../utilities/supabaseCalls.jsx';
import { checkIfReady } from '../utilities/helpers.jsx';
import { solutions } from '../utilities/constants.jsx';

async function fetchAndSetGame(name, setGame) {
  const result = await fetchGame(name);
  setGame(result);
}

export default function Game() {
  const chosenRole = localStorage.getItem('role');
  const { name } = useParams();
  const [game, setGame] = useState({});

  const [roundConfirm, setRoundConfirm] = useState(false);

  const youNeedToReady = (game.readying === true && game[chosenRole] === false);
  const othersNeedToReady = (game.readying === true && game[chosenRole] === true);
  const youNeedToFinish = (game.readying === false && game[chosenRole] === false);
  const othersNeedToFinish = (game.readying === false && game[chosenRole] === true);

  console.log('game page game: ', game);

  useEffect(() => {
    fetchAndSetGame(name, setGame);

    const interval = setInterval(() => fetchAndSetGame(name, setGame), 3000)

    return () => clearInterval(interval)
  }, []);


  const waitingToReady = (
    <div hidden={!othersNeedToFinish}>
      <p>Waiting for other players to proceed...</p>
    </div>
  );

  const readyingGame = (
    <div hidden={!youNeedToReady}>
      <button
        onClick={async () => {
          const newGameData = { [chosenRole]: true };
          const joinResult = await updateGame(game, newGameData);
          if (Array.isArray(joinResult)) {
            const newGameData = await fetchGame(game.name);
            if (checkIfReady(newGameData)) {
              updateGame(game, { readying: false, fox: false, wolf: false, pigeon: false, turtle: false });
            }
          }
        }}
      >
        Start Round {game.currentRound}!
      </button>
    </div>
  );

  const waitingToPlay = (
    <div hidden={!othersNeedToReady}>
      <p>Waiting for other players to ready up...</p>
    </div>
  );

  const playingGame = (
    <div hidden={!youNeedToFinish}>
      <p hidden={!roundConfirm}>To check your work, the letters on the edge(s) of the piece(s) facing you should say {solutions[game.currentRound] === undefined ? 'ERROR' : solutions[game.currentRound][chosenRole]}</p>
      <button hidden={roundConfirm} onClick={() => setRoundConfirm(true)}>
        Check Solution
      </button>
      <button
        hidden={!roundConfirm}
        onClick={async () => {
          setRoundConfirm(false);
          const newGameData = { [chosenRole]: true };
          const joinResult = await updateGame(game, newGameData);
          if (Array.isArray(joinResult)) {
            const newGameData = await fetchGame(game.name);
            if (checkIfReady(newGameData)) {
              updateGame(game, { currentRound: 2, readying: true, fox: false, wolf: false, pigeon: false, turtle: false });
            }
          }
        }}
      >
        Next Round!
      </button>
    </div>
  );


  const roundOne = (() => {
    if (game.currentRound != 1) {
      return;
    }

    let instructionLine = '';
    switch(chosenRole) {
      case 'fox':
        instructionLine = 'The Fox is the right-hand beast of the Wolf.';
        break;
      case 'wolf':
        instructionLine = 'The Wolf stares hungrily at the Turtle.';
        break;
      case 'turtle':
        instructionLine = 'The Turtle is to the left of the winged animal.';
        break;
      case 'pigeon':
        instructionLine = 'The pigeon stays as far as possible from the cunning Fox.';
    }
    const instructions = (
      <div>
        <p>For this game, you must orient yourselves in a certain order along the 4 sides of a table.</p>
        <p>Consider this to be a warm-up puzzle.</p>
        <p>{instructionLine}</p>
        <p>When you are correctly oriented, put in your headphones.</p>
        <p>When you are ready to begin, click ready</p>
      </div>
    );

    return (
      <div>
        <div hidden={!youNeedToReady}>
          {instructions}
          <br />
          <p hidden={!roundConfirm}>To check your work, in clockwise order you should be: Fox, Wolf, Pigeon, Turtle</p>
          <button hidden={roundConfirm} onClick={() => setRoundConfirm(true)}>
            Start
          </button>
          <button
            hidden={!roundConfirm}
            onClick={async () => {
              setRoundConfirm(false);
              const newGameData = { [chosenRole]: true };
              const joinResult = await updateGame(game, newGameData);
              if (Array.isArray(joinResult)) {
                const newGameData = await fetchGame(game.name);
                if (checkIfReady(newGameData)) {
                  updateGame(game, { readying: false, fox: false, wolf: false, pigeon: false, turtle: false });
                }
              }
            }}
          >
            Actually Start
          </button>
        </div>
        {waitingToPlay}
        {playingGame}
      </div>
    );
  });

  const roundTwoThroughFive = [2,3,4,5].map((roundNumber) => {
    if (game.currentRound != roundNumber) {
      return;
    }
    return (
      <div key={`round-${roundNumber}`}>
        {waitingToReady}
        {readyingGame}
        {waitingToPlay}
        {playingGame}
      </div>
    );
  });

  return (
    <>
      <h1>Game</h1>
      <p>Your Role: {chosenRole}</p>
      {roundOne}
      {roundTwoThroughFive}
    </>
  );
}