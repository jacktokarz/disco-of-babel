import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchGame, updateGame } from '../utilities/supabaseCalls.jsx';
import { checkIfReady } from '../utilities/helpers.jsx';
import { accordionStyle, accordionSummaryStyle, accordionDetailsStyle, solutions } from '../utilities/constants.jsx';
import music from '../sounds/song.mp3';
import musicTwo from '../sounds/song2.mp3';
import musicThree from '../sounds/song3.mp3';

async function fetchAndSetGame(name, setGame) {
  const result = await fetchGame(name);
  setGame(result);
}

let oneSong, twoSong, threeSong, fourSong, fiveSong, sixSong;

async function importSongs(role) {
  oneSong = await import(`../sounds/one/${role}.mp3`);
  oneSong = oneSong.default;
  twoSong = await import(`../sounds/two/${role}.mp3`);
  twoSong = twoSong.default;
  threeSong = await import(`../sounds/three/${role}.mp3`);
  threeSong = threeSong.default;
  fourSong = await import(`../sounds/four/${role}.mp3`);
  fourSong = fourSong.default;
  fiveSong = await import(`../sounds/five/${role}.mp3`);
  fiveSong = fiveSong.default;
  sixSong = await import(`../sounds/six/${role}.mp3`);
  sixSong = sixSong.default;
}

const musicAudio = new Audio(music);
musicAudio.loop = true;
musicAudio.volume = 0.75;
const audio = new Audio();
audio.loop = true;
// const roundEndAudio = new Audio();

export default function Game() {
  const chosenRole = localStorage.getItem('role');
  const { name } = useParams();
  const [game, setGame] = useState({});
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [roundConfirm, setRoundConfirm] = useState(false);

  const youNeedToReady = (game.readying === true && game[chosenRole] === false);
  const othersNeedToReady = (game.readying === true && game[chosenRole] === true);
  const youNeedToFinish = (game.readying === false && game[chosenRole] === false);
  const othersNeedToFinish = (game.readying === false && game[chosenRole] === true);

  useEffect(() => {
    fetchAndSetGame(name, setGame);
    importSongs(chosenRole);

    const interval = setInterval(() => fetchAndSetGame(name, setGame), 1000)

    return () => clearInterval(interval)
  }, []);


  const playAudio = (() => {
    switch (game.currentRound) {
      case 1:
        audio.src = oneSong;
        musicAudio.src = music;
        break;
      case 2:
        audio.src = twoSong;
        musicAudio.src = musicTwo;
        break;
      case 3:
        audio.src = threeSong;
        musicAudio.src = musicThree;
        break;
      case 4:
        audio.src = fourSong;
        break;
      case 5:
        audio.src = fiveSong;
        break;
      case 6:
        audio.src = sixSong;
        break;
      default:
        console.log('no case');
        break;
    }
    console.log("let's play");
    musicAudio.play();
    audio.play();
  });

  let instructionLine = '';
  switch(chosenRole) {
    case 'horse':
      instructionLine = 'The Horse is the right-hand beast of the Cat.';
      break;
    case 'cat':
      instructionLine = 'The Cat stares hungrily at the Rat.';
      break;
    case 'pigeon':
      instructionLine = 'The Pigeon roosts between the Cat and the Rat.';
      break;
    case 'Rat':
      instructionLine = 'The Rat keep the Pigeon on their right.';
  }
  const instructions = (
    <Accordion style={accordionStyle}>
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
        <p>These messages contain your personal Objective, Directive, and (sometimes) Code Word.</p>
        <p>The <span className="italic">Objective</span> is your piece of the requirements for how the bricks need to be laid out.</p>
        <p>The <span className="italic">Directive</span> is your limitation in how you are allowed to communicate with the other agents.</p>
        <p>Your <span className="italic">Code Word</span> (when provided) is what should be spelled on the side of the bricks(s) facing you at the end of the round. You can use this to double-check the solution.</p>
        <p><span className="important">IMPORTANT!</span> Do NOT share your Directive or Code Word with other agents!</p>
        <p>Conversely, you should absolutely share your Objective (as well as you can)...</p>
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
              updateGame(game, { readying: false, horse: false, cat: false, pigeon: false, rat: false });
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
      <p hidden={!roundConfirm}>
        {solutions[game.currentRound] === undefined || solutions[game.currentRound][chosenRole] === null  ?
        'No code word for you this round, agent. If all agents are satisfied, then you can proceed.' :
        `To check your work, the letters on the edge(s) of the piece(s) facing you should say ${solutions[game.currentRound][chosenRole]}`}
      </p>
      <button
        hidden={roundConfirm}
        onClick={() => setRoundConfirm(true)}
      >
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
              if (game.currentRound === 6) {
                setDisplaySuccess(true);
              }
              updateGame(game, { currentRound: parseInt(game.currentRound)+1, readying: true, horse: false, cat: false, pigeon: false, rat: false });
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
          <p hidden={!roundConfirm}>To check your work, in clockwise order you should be: Horse, Cat, Pigeon, Rat.</p>
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
                // musicAudio.play();
                if (checkIfReady(newGameData)) {
                  updateGame(game, { readying: false, horse: false, cat: false, pigeon: false, rat: false });
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

  const roundTwoThroughSix = [2,3,4,5,6].map((roundNumber) => {
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
      <p>Agent: {chosenRole}</p>
      <p>Round: {game.currentRound}</p>
      <h2 className="sparkles" hidden={!displaySuccess}>
        Congratulations agent. You saved the world! (or at least saved a fox? idk)
      </h2>
      {instructions}
      <RoundOne />
      {roundTwoThroughSix}
    </>
  );
}