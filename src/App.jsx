import './App.css';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import useWordle from './logic/useWordle';
import { useEffect } from 'react';


function App() {
  const {
    guesses,
    currentRow,
    // statuses, // statuses can be passed to Board if Tile rendering is done there
    enterLetter,
    deleteLetter,
    submitGuess,
    // solution // For debugging if needed
  } = useWordle();

  const handleKey = (key) => {
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      deleteLetter();
    } else if (key.length === 1 && key.match(/^[a-zA-Z]$/)) {
      enterLetter(key.toUpperCase());
    }
  };

  // Effect for physical keyboard input
  useEffect(() => {
    const listener = (event) => {
      const key = event.key.toUpperCase();
      if (key === 'ENTER') {
        handleKey('ENTER');
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        handleKey('BACKSPACE');
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        handleKey(key);
      }
    };
    window.addEventListener('keyup', listener);
    return () => {
      window.removeEventListener('keyup', listener);
    };
  }, [enterLetter, deleteLetter, submitGuess]); // Add dependencies

  return (
    <div id="app-container">
      <header>
        <h1>Pega-Wordle</h1>
      </header>
      <main>
        <Board guesses={guesses} currentRow={currentRow} />
        <Keyboard onKey={handleKey} />
      </main>
      {/* For debugging: <p>Solution: {solution}</p> */}
    </div>
  );
}

export default App;
