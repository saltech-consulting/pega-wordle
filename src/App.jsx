import './App.css';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import useWordle from './logic/useWordle';
import { useEffect, useState } from 'react';
import { GAME_STATE, MAX_GUESSES } from './utils/constants';


function App() {
  const {
    solution,
    hint,
    submittedGuesses,
    currentGuess,
    statuses,
    currentRow,
    gameState,
    keyStatuses,
    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
    remainingTime,
  } = useWordle();

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKey = (key) => {
    if (gameState !== GAME_STATE.PLAYING && key !== 'ENTER') { // Allow Enter for potential restart
        // Or simply return if game is over and not Enter
        if (gameState !== GAME_STATE.PLAYING) return;
    }

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      removeLetter();
    } else if (key.length === 1 && key.match(/^[a-zA-Z]$/)) {
      addLetter(key.toUpperCase());
    }
  };

  // Effect for physical keyboard input
  useEffect(() => {
    const listener = (event) => {
      // Prevent handling keyboard events if an input field is focused (not relevant here yet, but good practice)
      // if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      const key = event.key.toUpperCase();
      if (key === 'ENTER') {
        event.preventDefault(); // Prevent default form submission if any
        handleKey('ENTER');
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        event.preventDefault();
        handleKey('BACKSPACE');
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        event.preventDefault();
        handleKey(key);
      }
    };
    window.addEventListener('keydown', listener); // Changed to keydown for better responsiveness
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [addLetter, removeLetter, submitGuess, gameState]); // Add dependencies

  // Local state to toggle hint visibility
  const [showHint, setShowHint] = useState(false);

  const hintEnabled =
    gameState === GAME_STATE.PLAYING && currentRow === MAX_GUESSES - 1;

  return (
    <div id="app-container">
      <header>
        <h1>Pega-Wordle</h1>
      </header>
      <main>
        <div className="timer-display">Time: {formatTime(remainingTime)}</div>
        {gameState === GAME_STATE.WON && <div className="message win">You Won!</div>}
        {gameState === GAME_STATE.LOST && <div className="message lose">Game Over! The word was: {solution}</div>}

        <Board
          submittedGuesses={submittedGuesses}
          currentGuess={currentGuess}
          statuses={statuses}
          currentRow={currentRow}
        />
        <button
          disabled={!hintEnabled}
          onClick={() => hintEnabled && setShowHint(v => !v)}
        >
          Hint
        </button>
        {showHint && <p className="hint">{hint}</p>}
        <button onClick={() => { resetGame(); setShowHint(false); }}>
          New&nbsp;Game
        </button>
        <Keyboard onKey={handleKey} keyStatuses={keyStatuses} />
      </main>
      {/* For debugging: <p>Solution: {useWordle().solution}</p> */}
      {/* For debugging: <pre>{JSON.stringify(keyStatuses, null, 2)}</pre> */}
    </div>
  );
}

export default App;
