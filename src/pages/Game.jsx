import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchGame, updateGame } from '../utilities/supabaseCalls.jsx';
import { checkIfReady } from '../utilities/helpers.jsx';
import { accordionStyle, accordionSummaryStyle, AccordionDetailsStyle, solutions } from '../utilities/constants.jsx';
import exampleSound from '../sounds/example.mp3';
import secondExample from '../sounds/exampleTwo.mp3';

async function fetchAndSetGame(name, setGame) {
  const result = await fetchGame(name);
  if (Array.isArray(result)) {
    setGame(result[0]);
  }
  else {
    console.log("ERROR FETCHING ", name, result);
  }
}

let audio = new Audio(exampleSound);
audio.loop = true;

export default function Game() {
  const chosenRole = localStorage.getItem('role');
  const { name } = useParams();
  const [game, setGame] = useState({});

  const [roundConfirm, setRoundConfirm] = useState(false);

  const youNeedToReady = (game.readying === true && game[chosenRole] === false);
  const othersNeedToReady = (game.readying === true && game[chosenRole] === true);
  const youNeedToFinish = (game.readying === false && game[chosenRole] === false);
  const othersNeedToFinish = (game.readying === false && game[chosenRole] === true);

  console.log('game page audio: ', audio);

  useEffect(() => {
    fetchAndSetGame(name, setGame);

    const interval = setInterval(() => fetchAndSetGame(name, setGame), 3000)

    return () => clearInterval(interval)
  }, []);


  const playAudio = (() => {
    if (game.currentRound === 2) {
      audio.src = secondExample;
    }
    audio.play();
  });

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
    <Accordion defaultExpanded style={accordionStyle}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id={`instructions`}
        style={accordionSummaryStyle}
      >
        Instructions
      </AccordionSummary>
      <AccordionDetails style={accordionDetailsStyle}>
        <p>This game is played over a series of rounds in which you and your fellow agents collaborate to put 6 bricks in the correct orientation.</p>
        <p>Each round will build on the other, creating a stack of bricks.</p>
        <p>At the beginning of a round, every agent will hear a unique message in their headphones.</p>
        <p>These messages contain your personal Objective, Directive, and Code Word.</p>
        <p>The <span class="italic">Objective</span> is your piece of the requirements for how the bricks need to be laid out.</p>
        <p>The <span class="italic">Directive</span> is your limitation in how you are allowed to communicate with the other agents.</p>
        <p>Your <span class="italic">Code Word</span> is what should be spelled on the side of the bricks(s) facing you at the end of the round. You can use this to double-check the solution.</p>
        <p><span class="important">IMPORTANT!</span> Do NOT share your Directive or Code Word with other agents!</p>
        <p>Conversely, you should absolutely share your Objective (as well as you can).</p>
      </AccordionDetails>
    </Accordion>
  );

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
      <p>Listen to the recording from your handler to learn what challenges you must overcome to relay its message to your team.</p>
      <button hidden={!audio.paused} onClick={() => playAudio()}>
        Play Message
      </button>
      <button hidden={audio.paused} onClick={() => audio.currentTime = 0}>
        Restart Message
      </button>
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
            audio.pause();
            audio.currentTime = 0;
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


  const RoundOne = () => {
    if (game.currentRound != 1) {
      return;
    }

    const gettingStarted = (
      <div>
        <h2>Orientation:</h2>
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
          {gettingStarted}
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
        {waitingToReady}
      </div>
    );
  };

  const roundTwoThroughFive = [2,3,4,5].map((roundNumber) => {
    if (game.currentRound != roundNumber) {
      return;
    }
    return (
      <div key={`round-${roundNumber}`}>
        {readyingGame}
        {waitingToPlay}
        {playingGame}
        {waitingToReady}
      </div>
    );
  });

  return (
    <>
      <h1>Game</h1>
      <p>Your Agent: {chosenRole}</p>
      {instructions}
      <RoundOne />
      {roundTwoThroughFive}
    </>
  );
}