import './App.css';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import Leaderboard from './components/Leaderboard';
import SeriesCompletionModal from './components/SeriesCompletionModal';
import AdminPanel from './components/AdminPanel';
import useWordle from './logic/useWordle';
import useUserProfile from './hooks/useUserProfile';
import { useEffect, useState } from 'react';
import { GAME_STATE, MAX_GUESSES } from './utils/constants';
import { 
  loadUserScoreboard, 
  addUserGameResult, 
  getCurrentUserGameNumberInSeries,
  getUserGlobalRankings,
  getUserTopPerformers,
  calculateRankingAchievements
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
    startGame, // Import new function
    remainingTime,
  } = useWordle();

  // Local state
  const [showHint, setShowHint] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSeriesCompletion, setShowSeriesCompletion] = useState(false);
  const [seriesCompletionData, setSeriesCompletionData] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userScoreboard, setUserScoreboard] = useState({});
  const [gameStartTime, setGameStartTime] = useState(null);
  const [displayedGameNumber, setDisplayedGameNumber] = useState(0); // New state for UI display
  const [prevGameState, setPrevGameState] = useState(null); // To track game state transitions

  // Effect to track previous game state
  useEffect(() => {
    setPrevGameState(gameState);
  }, [gameState]);

  // Initialize game start time when game starts or reset when game ends/stops
  useEffect(() => {
    if (gameState === GAME_STATE.PLAYING && !gameStartTime) {
      setGameStartTime(Date.now());
    } else if (gameState !== GAME_STATE.PLAYING && gameStartTime) {
      // Reset gameStartTime if game is no longer playing (e.g., won, lost, or idle)
      setGameStartTime(null);
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
      const result = addUserGameResult(activeUser.email, gameResult, userScoreboard);
      setUserScoreboard(result.scoreboard);

      // Check if series was completed and show achievement modal
      if (result.seriesCompleted && result.completedSeriesData) {
        const userProfiles = loadUserProfiles();
        const rankingData = calculateRankingAchievements(
          activeUser.email,
          userScoreboard,
          result.scoreboard,
          userProfiles
        );

        const seriesStats = {
          totalAttempts: result.completedSeriesData.totalAttempts,
          totalTime: result.completedSeriesData.totalTime,
          gamesWon: result.completedSeriesData.games.filter(g => g.status === 'won').length,
          totalGames: result.completedSeriesData.games.length,
          isPerfectSeries: result.completedSeriesData.games.every(g => g.status === 'won')
        };

        setSeriesCompletionData({
          seriesData: seriesStats,
          rankingData
        });
        setShowSeriesCompletion(true);
      }

      // Force leaderboard refresh for real-time updates
      if (showLeaderboard) {
        // Leaderboard will automatically re-render with updated data
      }

      // Reset game start time
      setGameStartTime(null);
    }
  }, [gameState, gameStartTime, isLoggedIn, activeUser, solution, currentRow, recordGameResult, userScoreboard]);

  // Effect to manage the displayed game number
  useEffect(() => {
    if (isLoggedIn && activeUser) {
      const prospectiveGameNumber = getCurrentUserGameNumberInSeries(activeUser.email, userScoreboard);

      if (gameState === GAME_STATE.PLAYING) {
        setDisplayedGameNumber(prospectiveGameNumber);
      } else if (gameState === GAME_STATE.WON || gameState === GAME_STATE.LOST) {
        if (prevGameState === GAME_STATE.PLAYING) {
          // Game just finished, displayedGameNumber is already correct (showing the finished game's number).
          // No change needed.
        } else {
          // App loaded into a WON/LOST state, or state changed without passing through PLAYING.
          // prospectiveGameNumber is (games_played + 1). We want to show games_played.
          if (prospectiveGameNumber > 0) {
            setDisplayedGameNumber(prospectiveGameNumber - 1);
          } else {
            setDisplayedGameNumber(0); // Series completed or no active series.
          }
        }
      } else if (displayedGameNumber === 0 && prospectiveGameNumber > 0) {
          // Initial load, not PLAYING, not WON/LOST (e.g. user logs in, no game started yet in series)
          // Or if for some reason gameState is not one of the above but a series exists.
          setDisplayedGameNumber(prospectiveGameNumber);
      }
    } else {
      setDisplayedGameNumber(0); // User logged out
    }
  }, [gameState, prevGameState, isLoggedIn, activeUser, userScoreboard]);

  // Handle profile switching - reset game state
  const handleSwitchUser = (email) => {
    const success = switchUser(email);
    if (success) {
      resetGame();
      setShowHint(false);
      setShowProfile(false);
      setShowLeaderboard(false);
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
    setShowLeaderboard(false);
    setGameStartTime(null);
    setUserScoreboard({});
  };

  // Handle new game - reset hint and start game
  const handleNewGame = () => {
    resetGame(); // Resets game state to IDLE, gets new word, resets timer
    startGame(); // Sets game state to PLAYING, which starts the timer
    setShowHint(false);
    setShowSeriesCompletion(false);
    // gameStartTime is now managed by the useEffect above
  };

  // Handle series completion modal actions
  const handleSeriesCompletionClose = () => {
    setShowSeriesCompletion(false);
    setSeriesCompletionData(null);
  };

  const handleViewLeaderboard = () => {
    setShowSeriesCompletion(false);
    setShowLeaderboard(true);
  };

  const handlePlayAgain = () => {
    handleNewGame();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKey = (key) => {
    // Only allow game input if user is logged in
    if (!isLoggedIn) return;

    // Allow keyboard input only if game is PLAYING or if it's ENTER/BACKSPACE
    // which might be used to start/reset in some contexts (though not here directly)
    if (gameState !== GAME_STATE.PLAYING && key !== 'ENTER' && key !== 'BACKSPACE' && key !== 'DELETE') {
      return;
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
      // Check for admin panel shortcut: Ctrl+Shift+A
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        if (isLoggedIn && activeUser?.email?.endsWith('@saltech-consulting.com')) {
          setShowAdminPanel(true);
        } else if (isLoggedIn) {
          alert('Admin access restricted to Saltech Consulting staff only.');
        }
        return;
      }

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
  }, [isLoggedIn, activeUser, addLetter, removeLetter, submitGuess, gameState]);

  const hintEnabled = isLoggedIn && 
    gameState === GAME_STATE.PLAYING && 
    currentRow === MAX_GUESSES - 1;

  // Get current series info for display
  // const currentGameNumber = isLoggedIn && activeUser ? 
  //   getCurrentUserGameNumberInSeries(activeUser.email, userScoreboard) : 0;

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

  // Show leaderboard view
  if (showLeaderboard) {
    const userProfiles = loadUserProfiles();
    return (
      <div id="app-container">
        <header>
          <h1>Pega-Wordle</h1>
        </header>
        <main>
          <Leaderboard
            currentPlayerName={activeUser.fullName}
            scoreboardData={userScoreboard}
            userProfiles={userProfiles}
          />
          <div className="leaderboard-actions">
            <button 
              onClick={() => setShowLeaderboard(false)}
              className="back-to-game-button"
            >
              Back to Game
            </button>
          </div>
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
            {displayedGameNumber > 0 && (
              <span className="series-info">Game {displayedGameNumber} of 3</span>
            )}
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="leaderboard-button"
              title="View Leaderboard"
            >
              Leaderboard
            </button>
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
        
        {/* Series Completion Modal */}
        {seriesCompletionData && (
          <SeriesCompletionModal
            isVisible={showSeriesCompletion}
            onClose={handleSeriesCompletionClose}
            seriesData={seriesCompletionData.seriesData}
            rankingData={seriesCompletionData.rankingData}
            onViewLeaderboard={handleViewLeaderboard}
            onPlayAgain={handlePlayAgain}
          />
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
            activeUserEmail={activeUser?.email}
          />
        )}
      </main>
    </div>
  );
}

export default App;
