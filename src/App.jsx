// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap-icons/font/bootstrap-icons.css';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';



const INITIAL_STATE = Array(9).fill(null);

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningSquares: [a, b, c] };
    }
  }

  return { winner: null, winningSquares: [] };
};

const App = () => {
  const [squares, setSquares] = useState(INITIAL_STATE);
  const [xIsNext, setXIsNext] = useState(true);
  const [vsBot, setVsBot] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, winningSquares: [] });
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [tieCount, setTieCount] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [nightMode, setNightMode] = useState(false);

  const toggleNightMode = () => {
    setNightMode((prevNightMode) => !prevNightMode);
  };
  

  const handleClick = (index) => {
    if (vsBot && !xIsNext) {
      return;
    }

    const { winner, winningSquares } = calculateWinner(squares);
    if (winner || squares[index]) {
      return;
    }

    let newSquares = squares.slice();
    newSquares[index] = xIsNext ? 'X' : 'O';

    setSquares(newSquares);
    setXIsNext(!xIsNext);

    const squareElement = document.querySelector(`.square-${index}`);
    if (squareElement) {
      squareElement.classList.add(`${xIsNext ? 'x-pop' : 'o-pop'}`);
      setTimeout(() => {
        squareElement.classList.remove(`${xIsNext ? 'x-pop' : 'o-pop'}`);
      }, 300);
    }

    const { winner: newWinner, winningSquares: newWinningSquares } = calculateWinner(newSquares);
    setWinnerInfo({ winner: newWinner, winningSquares: newWinningSquares });

    if (vsBot && !newWinner) {
      setTimeout(() => {
        makeBotMove(newSquares);
      }, 1000);
    }
  };

  const makeBotMove = (currentSquares) => {
    const emptySquares = currentSquares
      .map((square, index) => (!square ? index : null))
      .filter((index) => index !== null);

    if (emptySquares.length > 0) {
      const botMove = getBestMove(currentSquares, 'O');
      const newSquares = currentSquares.slice();
      newSquares[botMove] = 'O';

      setSquares(newSquares);
      setXIsNext(true);

      const { winner, winningSquares } = calculateWinner(newSquares);
      setWinnerInfo({ winner, winningSquares });
    }
  };

  const getBestMove = (squares, player) => {
    let bestScore = player === 'O' ? -Infinity : Infinity;
    let bestMove = -1;

    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        squares[i] = player;
        const score = minimax(squares, 0, false);
        squares[i] = null;

        if ((player === 'O' && score > bestScore) || (player === 'X' && score < bestScore)) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const minimax = (squares, depth, isMaximizing) => {
    const { winner } = calculateWinner(squares);
    if (winner) {
      return winner === 'O' ? 1 : -1;
    }

    if (squares.every((square) => square !== null)) {
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const handleSwitchMode = () => {
    setVsBot((prevVsBot) => !prevVsBot);
    setSquares(INITIAL_STATE);
    setXIsNext(true);
    setWinnerInfo({ winner: null, winningSquares: [] });

    if (!xIsNext && vsBot) {
      makeBotMove(INITIAL_STATE);
    }
  };

  const handleRematch = () => {
    setSquares(INITIAL_STATE);
    setXIsNext(true);
    setWinnerInfo({ winner: null, winningSquares: [] });

    if (vsBot && !xIsNext) {
      makeBotMove(INITIAL_STATE);
    }
  };

  const handleScore = () => {
    if (winnerInfo.winner === 'X') {
      if (vsBot) {
        // Player vs Bot mode
        setPlayerScore((prevScore) => prevScore + 1);
      } else {
        // Player vs Player mode
        setPlayer1Score((prevScore) => prevScore + 1);
      }
    } else if (winnerInfo.winner === 'O') {
      if (vsBot) {
        // Player vs Bot mode
        setBotScore((prevScore) => prevScore + 1);
      } else {
        // Player vs Player mode
        setPlayer2Score((prevScore) => prevScore + 1);
      }
    } else {
      setTieCount((prevTieCount) => prevTieCount + 1);
    }
  };

  const renderSquare = (index) => {
    const isWinnerSquare = winnerInfo.winningSquares.includes(index);

    return (
      <button
        className={`square ${
          squares[index] === 'X' ? 'x-square' : squares[index] === 'O' ? 'o-square' : ''
        } ${isWinnerSquare ? `${squares[index]?.toLowerCase()}-win` : ''} ${
          xIsNext ? 'x-turn' : 'o-turn'
        }`}
        onClick={() => handleClick(index)}
      >
        {squares[index]}
      </button>
    );
  };

  useEffect(() => {
    if (vsBot && !xIsNext) {
      makeBotMove(INITIAL_STATE);
    }
  }, [vsBot]);

  useEffect(() => {
    if (winnerInfo.winner || squares.every((square) => square)) {
      handleScore();
    }
  }, [winnerInfo.winner, squares]);

  const status = winnerInfo.winner
    ? `Winner: ${winnerInfo.winner}`
    : squares.every((square) => square)
    ? 'Tie!'
    : `Player Turn : ${xIsNext ? 'X' : 'O'}`;

    return (
      <div>
 <div className={`navbar-container ${nightMode ? 'night-mode' : ''}`}>
      <nav className="navbar navbar-light bg-body-tertiary">
        <div className="container d-flex justify-content-between align-items-center">
          <button className="btn btn-dark switch-button" onClick={handleSwitchMode} style={{ marginRight: '8px' }}>
            {vsBot ? <i className="bi bi-person"></i> : <i className="bi bi-robot"></i>}
          </button>
          <a className="navbar-brand" href="#">
            <strong className="text-center d-block">TicTacToe</strong>
          </a>
          <div className="d-flex justify-content-end">
            <Toggle
              checked={nightMode}
              onChange={toggleNightMode}
              icons={{
                checked: <i className="bi bi-moon moon-icon" style={{ fontSize: '12px' }}></i>,
                unchecked: <i className="bi bi-sun sun-icon" style={{ fontSize: '12px' }}></i>,
              }}
            />
          </div>
        </div>
      </nav>
    </div>

{/* Existing game content */}
<div className={`container-fluid ${nightMode ? 'night-mode' : ''}`}>
        <div className="game">
          <div className="game-board">
          <div className="board">
                <div className="board-container">
                  {[0, 1, 2].map((row) => (
                    <div className="board-row" key={row}>
                      {[0, 1, 2].map((col) => (
                        <div key={col} className="square-container">
                          {renderSquare(row * 3 + col)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            <div className="status">{status}</div>
            {vsBot && (
              <div className="scoreboard row">
              <div className="col-12 col-md-4">
                <p className="font-weight-bold">Player (X): {playerScore}</p>
              </div>
              <div className="col-12 col-md-4">
                <p className="font-weight-bold">Bot (O): {botScore}</p>
              </div>
              <div className="col-12 col-md-4">
                <p className="font-weight-bold">Ties: {tieCount}</p>
              </div>
            </div>
          )}
          {!vsBot && (
            <div className="scoreboard row">
              <div className="col-12 col-md-4">
                <p className="font-weight-bold">X Score: {player1Score}</p>
              </div>
              <div className="col-12 col-md-4">
                <p className="font-weight-bold">O Score: {player2Score}</p>
              </div>
              <div className="col-12 col-md-4">
                <p className="font-weight-bold">Ties: {tieCount}</p>
              </div>
            </div>
            )}
              <div>
                
              </div>

         
              
              <button className="btn btn-success rematch-button" onClick={handleRematch}>
                Rematch
              </button>
              
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default App;
