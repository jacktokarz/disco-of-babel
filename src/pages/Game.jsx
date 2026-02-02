import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  accordionStyle,
  accordionSummaryStyle,
  accordionDetailsStyle,
  roleOptions,
  solutions,
} from '../utilities/constants.jsx';
import music from '../sounds/music/song.mp3';
import musicTwo from '../sounds/music/song2.mp3';
import musicThree from '../sounds/music/song3.mp3';
import credits from '../sounds/ending.mp3';
// import roundEnd from '../sounds/end.wav';
// import roundEndTwo from '../sounds/endTwo,wav';
// import roundEndThree from '../sounds/endThree.wav';
// import roundEndFour from '../sounds/endFour.wav';
// import roundEndFive from '../sounds/endFive.wav';
// import roundEndSix from '../sounds/endSix.wav';

let oneSong, twoSong, threeSong, fourSong, fiveSong, sixSong;

const musicAudio = new Audio(music);
musicAudio.loop = true;
musicAudio.volume = 0.75;
const instructionsAudio = new Audio();
// const roundEndAudio = new Audio(roundEnd);

export default function Game() {
  const [currentRound, setCurrentRound] = useState(1);
  const [chosenRole, setChosenRole] = useState(null);
  const [playingRound, setPlayingRound] = useState(false);
  const [displaySuccess, setDisplaySuccess] = useState(false);
  const [roundConfirm, setRoundConfirm] = useState(false);

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

  const playAudio = (() => {
    const musicStringParts = musicAudio.src.split('/');
    console.log('music string ', musicStringParts[musicStringParts.length-1]);
    switch (currentRound) {
      case 1:
        instructionsAudio.src = oneSong;
        // roundEndAudio.src = roundEnd;
        if (musicStringParts[musicStringParts.length-1] !== "song.mp3") {
          musicAudio.src = music;
        }
        break;
      case 2:
        instructionsAudio.src = twoSong;
        // roundEndAudio.src = roundEndTwo;
        break;
      case 3:
        instructionsAudio.src = threeSong;
        // roundEndAudio.src = roundEndThree;
        if (musicStringParts[musicStringParts.length-1] !== "song2.mp3") {
          musicAudio.src = musicTwo;
        }
        break;
      case 4:
        instructionsAudio.src = fourSong;
        // roundEndAudio.src = roundEndFour;
        if (musicStringParts[musicStringParts.length-1] !== "song2.mp3") {
          musicAudio.src = musicTwo;
        }
        break;
      case 5:
        instructionsAudio.src = fiveSong;
        // roundEndAudio.src = roundEndFive;
        if (musicStringParts[musicStringParts.length-1] !== "song3.mp3") {
          musicAudio.src = musicThree;
        }
        break;
      case 6:
        instructionsAudio.src = sixSong;
        // roundEndAudio.src = roundEndSix;
        if (musicStringParts[musicStringParts.length-1] !== "song3.mp3") {
          musicAudio.src = musicThree;
        }
        break;
      default:
        console.log('no case');
        break;
    }
    musicAudio.play();
    instructionsAudio.play();
  });

  const introduction = (
    <div>
      <p>Welcome! You are about to embark on a game of abstruse assembling, blundered building, and confused construction.</p>
      <p>It`s as easy as ABC</p>
      <p>A game can only be played with exactly 4 players who each have their own headphones.</p>
      <p>You must be in the same place, with the game`s blocks in the center of a table.</p>
      <p>To begin, discuss among your group who will play each of the 4 animal codenames listed below (everyone must play a different role).</p>
      <p>When you are ready to play, click on the role, and you will receive further instructions.</p>
    </div>
  );

  const chooseRole = (
    <div>
      {roleOptions.map((role) => {
        return (
          <button
            key={role}
            onClick={async () => {
              setChosenRole(role);
              await importSongs(role);
            }}
          >
            Play as {role}
          </button>
        );
      })}
    </div>
  );

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

  const readyingGame = (
    <div hidden={playingRound || currentRound > 6}>
      <button
        onClick={() => {
          setPlayingRound(true);
        }}
      >
        Start Round {currentRound}!
      </button>
      <button
        style={{ "fontSize": '16px', "marginTop": '60px' }}
        hidden={currentRound === 6}
        onClick={() => setCurrentRound(currentRound+1)}
      >
        Skip This Round
      </button>
    </div>
  );

  const playingGame = (
    <div hidden={!playingRound}>
      <p>Listen to the recording from your handler to learn what challenges you must overcome while relaying its message to your team.</p>
      <button
        hidden={!instructionsAudio.paused}
        onClick={() => playAudio()}
      >
        Play Message
      </button>
      <button
        hidden={instructionsAudio.paused}
        onClick={() => {
          instructionsAudio.currentTime = 0;
          instructionsAudio.play();
        }}
      >
        Restart Message
      </button>
      <p hidden={!roundConfirm}>
        {solutions[currentRound][chosenRole] === null ?
        'No code word for you this round, agent. If all agents are satisfied, then you can proceed.' :
        `To check your work, the letters along the edges of the piece(s) facing you should say ${solutions[currentRound][chosenRole]}`}
      </p>
      <button
        style={{ "marginTop": '60px' }}
        hidden={roundConfirm}
        onClick={() => setRoundConfirm(true)}
      >
        Check Solution
      </button>
      <button
        hidden={!roundConfirm}
        onClick={async () => {
          setRoundConfirm(false);
          setPlayingRound(false);
          setCurrentRound(currentRound+1);
          instructionsAudio.pause();
          instructionsAudio.currentTime = 0;
          // roundEndAudio.play();
          if (currentRound === 6) {
            setDisplaySuccess(true);
            musicAudio.pause();
            instructionsAudio.src = credits;
            instructionsAudio.play();
          }
        }}
      >
        Finish Round!
      </button>
    </div>
  );


  const RoundOne = () => {
    if (currentRound != 1) {
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
        <div hidden={playingRound}>
          {gettingStarted}
          <br />
          <p hidden={!roundConfirm}>To check your work, in clockwise order you should be: Horse, Cat, Pigeon, Rat.</p>
          <button hidden={roundConfirm} onClick={() => setRoundConfirm(true)}>
            Ready
          </button>
          <button
            hidden={!roundConfirm}
            onClick={() => {
              setRoundConfirm(false);
              setPlayingRound(true);
            }}
          >
            Actually Start!
          </button>
          <button
            style={{ "display": 'block', "fontSize": '16px', "marginTop": '60px' }}
            onClick={() => setCurrentRound(currentRound+1)}
          >
            Skip Round 1
          </button>
        </div>
        {playingGame}
      </div>
    );
  };

  const roundTwoThroughSix = [2,3,4,5,6].map((roundNumber) => {
    if (currentRound != roundNumber) {
      return;
    }
    return (
      <div key={`round-${roundNumber}`}>
        {readyingGame}
        {playingGame}
      </div>
    );
  });

  return (
    <>
      <h1>Disco-Babble!</h1>
      <div hidden={chosenRole !== null}>
        {introduction}
        {chooseRole}
      </div>
      <div hidden={chosenRole === null}>
        <p>Agent: {chosenRole}</p>
        <p>Round: {currentRound}</p>
        <h2 className="sparkles" hidden={!displaySuccess}>
          Congratulations agent. You saved the world! Now get ready to smash that tower :D
        </h2>
        {instructions}
        <RoundOne />
        {roundTwoThroughSix}
      </div>
    </>
  );
}