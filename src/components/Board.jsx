import React from 'react';
// import Tile from './Tile'; // Will be used in later steps

// eslint-disable-next-line react/prop-types
const Board = ({ guesses, currentRow }) => {
  // Placeholder: Render a simple message or basic grid structure
  // In a later step, this will map through guesses to render rows of Tiles
  console.log('Board guesses:', guesses, 'currentRow:', currentRow);
  return (
    <div className="board">
      <p>Board Component</p>
      {/* Example of how rows might be structured later: */}
      {/* {guesses.map((guess, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {guess.map((letter, tileIndex) => (
            <Tile key={tileIndex} letter={letter} status={statuses[rowIndex][tileIndex]} />
          ))}
        </div>
      ))} */}
    </div>
  );
};

export default Board;
