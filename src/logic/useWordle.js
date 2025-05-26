import { useState } from 'react';

const useWordle = () => {
  const solution = "RULES"; // Hard-coded solution as per requirements

  // Initialize guesses: 6 rows, 5 columns, all empty strings
  const [guesses, setGuesses] = useState(Array(6).fill(null).map(() => Array(5).fill('')));
  
  // Initialize statuses for tiles (e.g., 'correct', 'present', 'absent')
  const [statuses, setStatuses] = useState(Array(6).fill(null).map(() => Array(5).fill('')));

  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0); // To track current letter position in the row

  const enterLetter = (letter) => {
    if (currentCol < 5 && currentRow < 6) {
      const newGuesses = guesses.map((row, rIdx) => {
        if (rIdx === currentRow) {
          const newRow = [...row];
          newRow[currentCol] = letter;
          return newRow;
        }
        return row;
      });
      setGuesses(newGuesses);
      setCurrentCol(currentCol + 1);
      console.log(`Letter entered: ${letter}. Current guess: ${newGuesses[currentRow].join('')}`);
    }
  };

  const deleteLetter = () => {
    if (currentCol > 0) {
      const newGuesses = guesses.map((row, rIdx) => {
        if (rIdx === currentRow) {
          const newRow = [...row];
          newRow[currentCol - 1] = ''; // Clear the letter
          return newRow;
        }
        return row;
      });
      setGuesses(newGuesses);
      setCurrentCol(currentCol - 1);
      console.log(`Letter deleted. Current guess: ${newGuesses[currentRow].join('')}`);
    }
  };

  const submitGuess = () => {
    if (currentRow < 6 && currentCol === 5) {
      const currentGuessStr = guesses[currentRow].join('');
      console.log(`Guess submitted: ${currentGuessStr}`);
      // Stub: Actual validation and status update logic will go here.
      // For now, just move to the next row if not the last row.
      
      // Example of status update (to be refined)
      const newStatusesRow = guesses[currentRow].map((char, index) => {
        if (solution[index] === char) return 'correct';
        if (solution.includes(char)) return 'present';
        return 'absent';
      });

      const newStatuses = [...statuses];
      newStatuses[currentRow] = newStatusesRow;
      setStatuses(newStatuses);

      if (currentGuessStr === solution) {
        console.log("Congratulations! You've guessed the word!");
        // Potentially set a game over state here
      } else if (currentRow < 5) {
        setCurrentRow(currentRow + 1);
        setCurrentCol(0); // Reset column for the new row
      } else {
        console.log(`Game over! The word was: ${solution}`);
        // Potentially set a game over state here
      }
    } else {
      console.log("Cannot submit guess. Ensure 5 letters are entered.");
    }
  };

  return {
    solution,
    guesses,
    currentRow,
    statuses, // Make sure statuses are returned
    enterLetter,
    deleteLetter, // Add deleteLetter to returned object
    submitGuess,
  };
};

export default useWordle;
