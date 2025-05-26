import './App.css';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import useWordle from './logic/useWordle';
import { useEffect } from 'react';
import { GAME_STATE } from './utils/constants';


function App() {
  const {
    // solution, // For debugging
    submittedGuesses,
    currentGuess,
    statuses,
    currentRow,
    gameState,
    keyStatuses,
    addLetter,
    removeLetter,
    submitGuess,
  } = useWordle();

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

  return (
    <div id="app-container">
      <header>
        <h1>Pega-Wordle</h1>
      </header>
      <main>
        {gameState === GAME_STATE.WON && <div className="message win">You Won!</div>}
        {gameState === GAME_STATE.LOST && <div className="message lose">Game Over! The word was: {useWordle().solution}</div>}
        
        <Board
          submittedGuesses={submittedGuesses}
          currentGuess={currentGuess}
          statuses={statuses}
          currentRow={currentRow}
        />
        <Keyboard onKey={handleKey} keyStatuses={keyStatuses} />
      </main>
      {/* For debugging: <p>Solution: {useWordle().solution}</p> */}
      {/* For debugging: <pre>{JSON.stringify(keyStatuses, null, 2)}</pre> */}
    </div>
  );
}

export default App;
