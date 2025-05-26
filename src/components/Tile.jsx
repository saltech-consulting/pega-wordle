import React from 'react';
import { TILE_STATUSES } from '../utils/constants';

// eslint-disable-next-line react/prop-types
const Tile = ({ letter, status }) => {
  // Ensure status defaults to empty if undefined or null
  const tileStatusClass = status || TILE_STATUSES.EMPTY;
  return (
    <div className={`tile ${tileStatusClass}`}>
      {letter}
    </div>
  );
};

export default Tile;
