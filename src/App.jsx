import './App.css';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import useWordle from './logic/useWordle';
import useUserProfile from './hooks/useUserProfile';
import { useEffect, useState } from 'react';
import { GAME_STATE, MAX_GUESSES } from './utils/constants';
import { 
  loadUserScoreboard, 
  addUserGameResult, 
  getCurrentUserGameNumberInSeries 
} from './utils/scoreboardUtils';
import { loadUserProfiles } from './utils/userProfileUtils';

function App() {
  // User profile management
  const {
    activeUser,
    isLoading: userLoading,
    isLoggedIn,
    loginUser,
    signUpUser,
    logoutUser,
    switchUser,
    recordGameResult,
    refreshActiveUser
  } = useUserProfile();

  // Game logic
  const {
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
    remainingTime,
  } = useWordle();

  // Local state
  const [showHint, setShowHint] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userScoreboard, setUserScoreboard] = useState({});
  const [gameStartTime, setGameStartTime] = useState(null);

  // Initialize game start time when game starts
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING && !gameStartTime) {
      setGameStartTime(Date.now());
    }
  }, [gameState, gameStartTime]);

  // Load user scoreboard when user changes
  useEffect(() => {
    if (isLoggedIn) {
      const scoreboard = loadUserScoreboard();
      setUserScoreboard(scoreboard);
    }
  }, [isLoggedIn, activeUser]);

  // Handle game completion and record results
  useEffect(() => {
    if ((gameState === GAME_STATE.WON || gameState === GAME_STATE.LOST) && 
        gameStartTime && isLoggedIn && activeUser) {
      
      const gameEndTime = Date.now();
      const timeTaken = Math.floor((gameEndTime - gameStartTime) / 1000);
      
      const gameResult = {
        word: solution,
        attempts: gameState === GAME_STATE.WON ? currentRow : MAX_GUESSES,
        timeTaken: timeTaken,
        status: gameState === GAME_STATE.WON ? 'won' : 'lost',
        timestamp: gameEndTime
      };

      // Record in user profile (for best games tracking)
      recordGameResult(gameResult);

      // Record in user scoreboard (for series tracking)
      const updatedScoreboard = addUserGameResult(activeUser.email, gameResult, userScoreboard);
      setUserScoreboard(updatedScoreboard);

      // Reset game start time
      setGameStartTime(null);
    }
  }, [gameState, gameStartTime, isLoggedIn, activeUser, solution, currentRow, recordGameResult, userScoreboard]);

  // Handle profile switching - reset game state
  const handleSwitchUser = (email) => {
    const success = switchUser(email);
    if (success) {
      resetGame();
      setShowHint(false);
      setShowProfile(false);
      setGameStartTime(null);
    }
    return success;
  };

  // Handle logout - reset everything
  const handleLogout = () => {
    logoutUser();
    resetGame();
    setShowHint(false);
    setShowProfile(false);
    setGameStartTime(null);
    setUserScoreboard({});
  };

  // Handle new game - reset hint and start time
  const handleNewGame = () => {
    resetGame();
    setShowHint(false);
    setGameStartTime(null);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKey = (key) => {
    // Only allow game input if user is logged in
    if (!isLoggedIn) return;

    if (gameState !== GAME_STATE.PLAYING && key !== 'ENTER') {
      if (gameState !== GAME_STATE.PLAYING) return;
    }

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE' || key === 'DELETE') {
      removeLetter();
    } else if (key.length === 1 && key.match(/^[a-zA-Z]$/)) {
      addLetter(key.toUpperCase());
    }
  };

  // Effect for physical keyboard input
  useEffect(() => {
    const listener = (event) => {
      // Don't handle keyboard events if user is not logged in or if an input field is focused
      if (!isLoggedIn || (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
        return;
      }

      const key = event.key.toUpperCase();
      if (key === 'ENTER') {
        event.preventDefault();
        handleKey('ENTER');
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        event.preventDefault();
        handleKey('BACKSPACE');
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        event.preventDefault();
        handleKey(key);
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [isLoggedIn, addLetter, removeLetter, submitGuess, gameState]);

  const hintEnabled = isLoggedIn && 
    gameState === GAME_STATE.PLAYING && 
    currentRow === MAX_GUESSES - 1;

  // Get current series info for display
  const currentGameNumber = isLoggedIn && activeUser ? 
    getCurrentUserGameNumberInSeries(activeUser.email, userScoreboard) : 0;

  // Show loading state
  if (userLoading) {
    return (
      <div id="app-container">
        <header>
          <h1>Pega-Wordle</h1>
        </header>
        <main>
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  // Show login form if not logged in
  if (!isLoggedIn) {
    return (
      <div id="app-container">
        <header>
          <h1>Pega-Wordle</h1>
        </header>
        <main>
          <LoginForm 
            onLogin={loginUser}
            onSignUp={signUpUser}
          />
        </main>
      </div>
    );
  }

  // Show profile view
  if (showProfile) {
    return (
      <div id="app-container">
        <header>
          <h1>Pega-Wordle</h1>
        </header>
        <main>
          <UserProfile
            activeUser={activeUser}
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
          />
          <div className="profile-actions">
            <button 
              onClick={() => setShowProfile(false)}
              className="back-to-game-button"
            >
              Back to Game
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main game view
  return (
    <div id="app-container">
      <header>
        <h1>Pega-Wordle</h1>
        <div className="header-info">
          <div className="user-info">
            <span className="welcome-text">Welcome, {activeUser.fullName}</span>
            {currentGameNumber > 0 && (
              <span className="series-info">Game {currentGameNumber} of 3</span>
            )}
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowProfile(true)}
              className="profile-button"
              title="View Profile"
            >
              Profile
            </button>
            <button 
              onClick={handleLogout}
              className="logout-button"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="timer-display">Time: {formatTime(remainingTime)}</div>
        {gameState === GAME_STATE.WON && <div className="message win">You Won!</div>}
        {gameState === GAME_STATE.LOST && <div className="message lose">Game Over! The word was: {solution}</div>}

        <Board
          submittedGuesses={submittedGuesses}
          currentGuess={currentGuess}
          statuses={statuses}
          currentRow={currentRow}
        />
        
        <div className="game-controls">
          <button
            disabled={!hintEnabled}
            onClick={() => hintEnabled && setShowHint(v => !v)}
            className="hint-button"
          >
            Hint
          </button>
          {showHint && <p className="hint">{hint}</p>}
          <button 
            onClick={handleNewGame}
            className="new-game-button"
          >
            New Game
          </button>
        </div>
        
        <Keyboard onKey={handleKey} keyStatuses={keyStatuses} />
      </main>
    </div>
  );
}

export default App;
