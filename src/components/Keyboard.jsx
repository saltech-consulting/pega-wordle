import React from 'react';
import { KEY_STATUSES } from '../utils/constants'; // Assuming KEY_STATUSES are defined

// eslint-disable-next-line react/prop-types
const Keyboard = ({ onKey, keyStatuses }) => {
  const keyboardRows = [
    "QWERTYUIOP".split(''),
    "ASDFGHJKL".split(''),
    ["ENTER", ..."ZXCVBNM".split(''), "BACKSPACE"],
  ];

  const getKeyClass = (key) => {
    let className = "keyboard-button";
    if (key === "ENTER" || key === "BACKSPACE") {
      className += " wide";
    }
    const status = keyStatuses[key.toUpperCase()]; // Ensure key is uppercase for lookup
    if (status) {
      className += ` ${status}`; // e.g., 'correct', 'present', 'absent'
    }
    return className;
  };


  return (
    <div className="keyboard">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              className={getKeyClass(key)}
              onClick={() => onKey(key)}
            >
              {key === "BACKSPACE" ? "BKSP" : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
