import React from 'react';
import Tile from './Tile';
import { WORD_LENGTH, MAX_GUESSES, TILE_STATUSES } from '../utils/constants';

// eslint-disable-next-line react/prop-types
const Board = ({ submittedGuesses, currentGuess, statuses, currentRow }) => {
  const rows = Array(MAX_GUESSES).fill(null);

  return (
    <div className="board">
      {rows.map((_, rowIndex) => {
        const isCurrentRow = rowIndex === currentRow;
        const guessString = isCurrentRow ? currentGuess : submittedGuesses[rowIndex];
        const rowStatuses = statuses[rowIndex];

        const tiles = Array(WORD_LENGTH).fill(null).map((__, tileIndex) => {
          let letter = '';
          let status = TILE_STATUSES.EMPTY;

          if (rowIndex < currentRow) { // Submitted guess row
            letter = submittedGuesses[rowIndex]?.[tileIndex] || '';
            status = rowStatuses?.[tileIndex] || TILE_STATUSES.EMPTY;
          } else if (isCurrentRow) { // Current typing row
            letter = currentGuess[tileIndex] || '';
            // Status for current row tiles: 'editing' if letter exists, else 'empty'
            // The actual 'correct'/'present'/'absent' status is applied after submission
            status = letter ? TILE_STATUSES.EDITING : TILE_STATUSES.EMPTY;
          }
          // Future rows will remain empty by default

          return <Tile key={tileIndex} letter={letter} status={status} />;
        });

        return (
          <div key={rowIndex} className="board-row">
            {tiles}
          </div>
        );
      })}
    </div>
  );
};

export default Board;
