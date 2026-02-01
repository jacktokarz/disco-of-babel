import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

export default function App() {
  const [color, setColor] = useState('#333333');

  function slightlyChangeColor(passedColor) {
    const hexSpot = 2*(Math.floor(Math.random() * 2.99) + 1); // this should result in either 2, 4, or 6;
    const newDigit = (passedColor.charAt(hexSpot) === '0') ? 9 : (passedColor.charAt(hexSpot) - 1);
    const newColor = passedColor.substring(0,hexSpot) + newDigit + passedColor.substring(hexSpot+1);
    document.body.style.backgroundColor = newColor;
    setColor(newColor);
  }

  useEffect(() => {
    document.body.style.backgroundColor = color;

    const interval = setInterval(() => slightlyChangeColor(color), 1000)

    return () => clearInterval(interval)
  }, [color]);

  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/game/:name" element={<Game />} />
    </Routes>
  )
}
