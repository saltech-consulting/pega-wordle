import React from 'react';

// eslint-disable-next-line react/prop-types
const Tile = ({ letter, status }) => {
  // Placeholder: Renders a single tile.
  // 'status' will be used to apply different styles (e.g., colors).
  return (
    <div className={`tile ${status || 'empty'}`}>
      {letter}
    </div>
  );
};

export default Tile;
