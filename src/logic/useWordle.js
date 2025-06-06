import { useState, useEffect, useCallback } from 'react';
import { WORD_LENGTH, MAX_GUESSES, TILE_STATUSES, GAME_STATE, KEY_STATUSES, GAME_DURATION_SECONDS } from '../utils/constants';
import wordList from '../data/pegawords.json';

// Helper to randomly pick a word-definition pair
const getRandomEntry = () => wordList[Math.floor(Math.random() * wordList.length)];

// Function to evaluate statuses for a guess against the solution
const getStatuses = (guess, solution) => {
  const guessChars = guess.split('');
  const solutionChars = solution.split('');
  const statuses = Array(solution.length).fill(TILE_STATUSES.ABSENT);
  const solutionLetterCounts = {};

  // Count letters in solution for accurate 'present' status
  solutionChars.forEach(letter => {
    solutionLetterCounts[letter] = (solutionLetterCounts[letter] || 0) + 1;
  });

  // First pass: Mark 'correct' letters
  guessChars.forEach((letter, index) => {
    if (letter === solutionChars[index]) {
      statuses[index] = TILE_STATUSES.CORRECT;
      solutionLetterCounts[letter]--;
    }
  });

  // Second pass: Mark 'present' letters
  guessChars.forEach((letter, index) => {
    if (statuses[index] !== TILE_STATUSES.CORRECT && solutionLetterCounts[letter] > 0) {
      statuses[index] = TILE_STATUSES.PRESENT;
      solutionLetterCounts[letter]--;
    }
  });

  return statuses;
};


const useWordle = () => {
  // Initialise solution & hint from one random entry
  const initialEntry = getRandomEntry();
  const [solution, setSolution] = useState(initialEntry.word.toUpperCase());
  const [hint, setHint] = useState(initialEntry.def);
  const [submittedGuesses, setSubmittedGuesses] = useState([]); // Array of strings
  const [currentGuess, setCurrentGuess] = useState(""); // String being typed
  const [statuses, setStatuses] = useState( // Array of arrays of tile statuses
    Array(MAX_GUESSES).fill(null).map(() => Array(WORD_LENGTH).fill(TILE_STATUSES.EMPTY))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [gameState, setGameState] = useState(GAME_STATE.IDLE);
  const [keyStatuses, setKeyStatuses] = useState({}); // e.g. {'A': 'correct', 'B': 'present'}
  const [remainingTime, setRemainingTime] = useState(GAME_DURATION_SECONDS);

  // Public helper to reset game state (but not start timer)
  const resetGame = useCallback(() => {
    const { word, def } = getRandomEntry();
    setSolution(word.toUpperCase());
    setHint(def);
    setSubmittedGuesses([]);
    setCurrentGuess("");
    setStatuses(
      Array(MAX_GUESSES)
        .fill(null)
        .map(() => Array(WORD_LENGTH).fill(TILE_STATUSES.EMPTY))
    );
    setCurrentRow(0);
    setGameState(GAME_STATE.IDLE); // Set to IDLE after reset
    setKeyStatuses({});
    setRemainingTime(GAME_DURATION_SECONDS); // Reset timer
  }, []);

  // Public helper to start the game (and timer)
  const startGame = useCallback(() => {
    setGameState(GAME_STATE.PLAYING);
    // If for some reason remainingTime is not full, reset it here.
    // This might happen if a game was lost by timeout and then "New Game" is pressed.
    if (remainingTime <= 0 || remainingTime === GAME_DURATION_SECONDS) {
      setRemainingTime(GAME_DURATION_SECONDS);
    }
  }, [remainingTime]);

  // Timer effect
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING && remainingTime > 0) {
      const timerId = setInterval(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (remainingTime === 0 && gameState === GAME_STATE.PLAYING) {
      setGameState(GAME_STATE.LOST);
    }
  }, [gameState, remainingTime, setGameState]);


  const addLetter = (letter) => {
    if (gameState !== GAME_STATE.PLAYING) return;
    if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + letter.toUpperCase());
    }
  };

  const removeLetter = () => {
    if (gameState !== GAME_STATE.PLAYING) return;
    if (currentGuess.length > 0) {
      setCurrentGuess(prev => prev.slice(0, -1));
    }
  };

  const submitGuess = () => {
    if (gameState !== GAME_STATE.PLAYING) return;
    if (currentGuess.length !== WORD_LENGTH) {
      // console.log("Guess must be 5 letters long."); // Optionally provide feedback
      return;
    }
    // TODO: Add word validation against the full word list (not just solution)
    // if (!wordList.some(entry => entry.word.toUpperCase() === currentGuess)) {
    //   console.log("Not a valid word.");
    //   return;
    // }

    if (currentRow >= MAX_GUESSES) {
      // console.log("No more guesses allowed.");
      return;
    }

    const guessStatuses = getStatuses(currentGuess, solution);

    // Update tile statuses for the current row
    const newStatuses = [...statuses];
    newStatuses[currentRow] = guessStatuses;
    setStatuses(newStatuses);

    // Update key statuses
    const newKeyStatuses = { ...keyStatuses };
    currentGuess.split('').forEach((char, index) => {
      const status = guessStatuses[index];
      // A key should only be upgraded in status (absent -> present -> correct)
      if (status === TILE_STATUSES.CORRECT ||
          (status === TILE_STATUSES.PRESENT && newKeyStatuses[char] !== TILE_STATUSES.CORRECT) ||
          (status === TILE_STATUSES.ABSENT && !newKeyStatuses[char])) {
        if (status === TILE_STATUSES.CORRECT) {
            newKeyStatuses[char] = KEY_STATUSES.CORRECT;
        } else if (status === TILE_STATUSES.PRESENT && newKeyStatuses[char] !== KEY_STATUSES.CORRECT) {
            newKeyStatuses[char] = KEY_STATUSES.PRESENT;
        } else if (status === TILE_STATUSES.ABSENT && !newKeyStatuses[char]) { // only if not already present or correct
            newKeyStatuses[char] = KEY_STATUSES.ABSENT;
        }
      }
    });
    setKeyStatuses(newKeyStatuses);

    setSubmittedGuesses(prev => [...prev, currentGuess]);
    setCurrentRow(prev => prev + 1);
    setCurrentGuess("");

    if (currentGuess === solution) {
      setGameState(GAME_STATE.WON);
      // console.log("Congratulations! You won!");
    } else if (currentRow + 1 === MAX_GUESSES) {
      setGameState(GAME_STATE.LOST);
      // console.log(`Game Over! The word was: ${solution}`);
    }
  };

  // For testing getStatuses:
  // useEffect(() => {
  //   console.log("Testing getStatuses('RULES', 'RULES'):", getStatuses('RULES', 'RULES')); // Expected: all correct
  //   console.log("Testing getStatuses('RUMES', 'RULES'):", getStatuses('RUMES', 'RULES')); // R,U,E,S correct, M absent
  //   console.log("Testing getStatuses('APPLE', 'PAPER'):", getStatuses('APPLE', 'PAPER')); // A,P,P,E present, L absent
  //   console.log("Testing getStatuses('SPEED', 'PEDAL'):", getStatuses('SPEED', 'PEDAL')); // P present, E correct, D present
  //   console.log("Testing getStatuses('ALLOW', 'APPLE'):", getStatuses('ALLOW', 'APPLE')); // A correct, L present, L absent, O absent, W absent
  // }, [solution]);


  return {
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
    startGame, // Export new function
    remainingTime,
  };
};

export default useWordle;
