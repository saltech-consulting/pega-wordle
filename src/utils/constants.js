export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

export const TILE_STATUSES = {
  EMPTY: 'empty',     // Tile has not been typed into yet for the current guess
  EDITING: 'editing', // Tile has a letter but not yet submitted
  CORRECT: 'correct', // Letter is in the correct position (green)
  PRESENT: 'present', // Letter is in the word but wrong position (yellow)
  ABSENT: 'absent',   // Letter is not in the word (grey)
};

export const KEY_STATUSES = {
  UNUSED: 'unused',   // Key has not been used or its status is unknown
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
};

// Example color map (can be used in CSS or inline styles if needed)
// These would typically be defined in CSS for better separation.
export const COLOR_MAP = {
  [TILE_STATUSES.CORRECT]: '#6aaa64', // Green
  [TILE_STATUSES.PRESENT]: '#c9b458', // Yellow
  [TILE_STATUSES.ABSENT]: '#787c7e',   // Dark Grey
  [TILE_STATUSES.EMPTY]: '#ffffff',    // White (or a very light grey for empty tiles)
  [TILE_STATUSES.EDITING]: '#d3d6da',  // Light Grey (for tiles with unsubmitted letters)
  borderDefault: '#d3d6da',
  borderEditing: '#878a8c',
};

export const GAME_STATE = {
  IDLE: 'idle',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;
export const GAME_DURATION_SECONDS = 120;
