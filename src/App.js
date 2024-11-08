import React, { useState, useEffect } from 'react';
import { FaEarlybirds, FaKiwiBird } from "react-icons/fa";
import { LuBird } from "react-icons/lu";
import { GiBirdMask, GiBirdTwitter, /*GiEgyptianBird, GiHummingbird, GiNestBirds*/ } from "react-icons/gi";
import './App.css';

const App = () => {
  const [level, setLevel] = useState(1); 
  const [pillData, setPillData] = useState([]);
  const [gameFinished, setGameFinished] = useState(false); 
  const [selectedPill, setSelectedPill] = useState(null); 
  const [availableMoves, setAvailableMoves] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState(3);

  // Map colors to icons
  const colorIcons = {
    red: <FaEarlybirds />,
    green: <FaKiwiBird />,
    blue: <LuBird />,
    yellow: <GiBirdMask />,
    purple: <GiBirdTwitter />
  };

  const generatePillData = (level) => {
    const colors = Object.keys(colorIcons); // Use colors from colorIcons map
    const pillsPerColor = 2 + Math.floor(level / 2); 
    setMaxCapacity(pillsPerColor);

    const totalPills = pillsPerColor * colors.length;
    const allPills = [];
    for (let i = 0; i < totalPills; i++) {
      allPills.push(colors[i % colors.length]);
    }

    for (let i = allPills.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPills[i], allPills[j]] = [allPills[j], allPills[i]];
    }

    const pillData = [];
    for (let i = 0; i < 5; i++) {
      pillData.push(allPills.splice(0, pillsPerColor));
    }
    pillData.push([]);
    pillData.push([]);

    return pillData;
  };

  const checkIfGameFinished = (pillData) => {
    const filledContainers = pillData.filter(
      pill => pill.length > 0 && new Set(pill).size === 1 && pill.length <= maxCapacity
    ).length;
    const emptyContainers = pillData.filter(pill => pill.length === 0).length;

    return filledContainers === 5 && emptyContainers === 2;
  };

  const handleLevelCompletion = () => {
    setGameFinished(false); 
    setLevel(level + 1); 
    setPillData(generatePillData(level + 1)); 
  };

  const handleDrop = (event, index) => {
    if (availableMoves.includes(index) && selectedPill) {
      const color = event.dataTransfer.getData('color');
      const newPillData = [...pillData];
      const targetPill = newPillData[index];

      if (
        targetPill.length < maxCapacity && 
        (targetPill.length === 0 || targetPill[targetPill.length - 1] === color)
      ) {
        targetPill.push(color);
        const updatedPillData = newPillData.map((pill, i) => {
          if (i === selectedPill.index) {
            return pill.slice(0, -1);
          }
          return pill;
        });

        setPillData(updatedPillData);
        setSelectedPill(null); 
      }
    }
  };

  const handleDragStart = (event, color, index) => {
    event.dataTransfer.setData('color', color);
    setSelectedPill({ color, index });
  };

  const determineAvailableMoves = (pillData, selectedPill) => {
    const available = [];
    if (selectedPill) {
      const { color, index } = selectedPill;
      const sourcePill = pillData[index];
      if (sourcePill.length > 0 && sourcePill[sourcePill.length - 1] === color) {
        pillData.forEach((pill, i) => {
          if (
            (pill.length === 0 || pill[pill.length - 1] === color) &&
            pill.length < maxCapacity
          ) {
            available.push(i);
          }
        });
      }
    }
    setAvailableMoves(available);
  };

  useEffect(() => {
    if (pillData.length === 0) {
      setPillData(generatePillData(level));
    }
    determineAvailableMoves(pillData, selectedPill);
    if (checkIfGameFinished(pillData)) {
      setGameFinished(true);
    }
  }, [level, pillData, selectedPill]);

  useEffect(() => {
    setPillData(generatePillData(level));
  }, [level]);

  return (
    <div className="container">
      <h1> BirdSort Level {level}</h1>
  
      <div className="game-board">
        {pillData.map((pill, index) => (
          <div
            key={index}
            className="container-box"
            onDrop={(event) => handleDrop(event, index)}
            onDragOver={(event) => event.preventDefault()}
          >
            {pill.map((color, i) => (
              <div
                key={i}
                className={`pill ${color} ${availableMoves.includes(index) ? 'available' : ''}`}
                draggable
                onDragStart={(event) => handleDragStart(event, color, index)}
              >
                {colorIcons[color]} {/* Use the icon instead of text */}
              </div>
            ))}
          </div>
        ))}
      </div>
  
      {gameFinished && (
        <div className="game-finished">
          <h2>Congratulations! You sorted the colors!</h2>
          <button onClick={handleLevelCompletion}>Next Level</button>
        </div>
      )}
    </div>
  );
};

export default App;