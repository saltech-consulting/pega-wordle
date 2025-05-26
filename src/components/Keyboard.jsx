import React from 'react';

// eslint-disable-next-line react/prop-types
const Keyboard = ({ onKey }) => {
  // Placeholder: Renders a simple message and a few example keys
  // In a later step, this will render a full on-screen keyboard
  // and potentially listen for physical keyboard events.

  const handleKeyClick = (key) => {
    if (onKey) {
      onKey(key);
    }
  };

  return (
    <div className="keyboard">
      <p>Keyboard Component</p>
      <button onClick={() => handleKeyClick('Q')}>Q</button>
      <button onClick={() => handleKeyClick('W')}>W</button>
      <button onClick={() => handleKeyClick('E')}>E</button>
      <button onClick={() => handleKeyClick('ENTER')}>ENTER</button>
      <button onClick={() => handleKeyClick('BACKSPACE')}>BKSP</button>
    </div>
  );
};

export default Keyboard;
