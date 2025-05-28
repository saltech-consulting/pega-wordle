const SCOREBOARD_KEY = 'pegaWordleScoreboard';
const USER_SCOREBOARD_KEY = 'pegaWordleUserScoreboard';
const MAX_SERIES_PER_PLAYER = 3;

/**
 * Loads the scoreboard from localStorage.
 * @returns {object} The scoreboard data.
 */
export const loadScoreboard = () => {
  try {
    const storedScoreboard = localStorage.getItem(SCOREBOARD_KEY);
    return storedScoreboard ? JSON.parse(storedScoreboard) : {};
  } catch (error) {
    console.error("Error loading scoreboard from localStorage:", error);
    return {};
  }
};

/**
 * Loads the user-based scoreboard from localStorage.
 * @returns {object} The user scoreboard data.
 */
export const loadUserScoreboard = () => {
  try {
    const storedScoreboard = localStorage.getItem(USER_SCOREBOARD_KEY);
    return storedScoreboard ? JSON.parse(storedScoreboard) : {};
  } catch (error) {
    console.error("Error loading user scoreboard from localStorage:", error);
    return {};
  }
};

/**
 * Saves the scoreboard to localStorage.
 * @param {object} scoreboard - The scoreboard data to save.
 */
export const saveScoreboard = (scoreboard) => {
  try {
    localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(scoreboard));
  } catch (error) {
    console.error("Error saving scoreboard to localStorage:", error);
  }
};

/**
 * Saves the user-based scoreboard to localStorage.
 * @param {object} scoreboard - The user scoreboard data to save.
 */
export const saveUserScoreboard = (scoreboard) => {
  try {
    localStorage.setItem(USER_SCOREBOARD_KEY, JSON.stringify(scoreboard));
  } catch (error) {
    console.error("Error saving user scoreboard to localStorage:", error);
  }
};

/**
 * Initializes a player in the scoreboard if they don't exist.
 * @param {string} playerName - The name of the player.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {object} The updated scoreboard data.
 */
export const initPlayer = (playerName, scoreboard) => {
  if (!playerName) return scoreboard;
  const updatedScoreboard = { ...scoreboard };
  if (!updatedScoreboard[playerName]) {
    updatedScoreboard[playerName] = []; // Array to store series
  }
  return updatedScoreboard;
};

/**
 * Initializes a user in the user scoreboard if they don't exist.
 * @param {string} userEmail - The email of the user.
 * @param {object} scoreboard - The current user scoreboard data.
 * @returns {object} The updated user scoreboard data.
 */
export const initUser = (userEmail, scoreboard) => {
  if (!userEmail) return scoreboard;
  const updatedScoreboard = { ...scoreboard };
  if (!updatedScoreboard[userEmail]) {
    updatedScoreboard[userEmail] = []; // Array to store series
  }
  return updatedScoreboard;
};

/**
 * Gets the current active series for a player or starts a new one.
 * A series is active if it's not "COMPLETED" and has less than 3 games.
 * @param {string} playerName - The name of the player.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {{series: object | null, seriesIndex: number}} The active series and its index.
 */
const getActiveSeries = (playerName, scoreboard) => {
  if (!playerName || !scoreboard[playerName]) {
    return { series: null, seriesIndex: -1 };
  }

  const playerSeries = scoreboard[playerName];
  let activeSeries = playerSeries.find(
    (s) => s.seriesStatus !== 'COMPLETED' && s.games.length < 3
  );
  let activeSeriesIndex = playerSeries.findIndex(
    (s) => s.seriesStatus !== 'COMPLETED' && s.games.length < 3
  );

  if (!activeSeries) {
    activeSeries = {
      seriesId: `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      games: [],
      totalAttempts: 0,
      totalTime: 0,
      seriesStatus: 'IN_PROGRESS', // 'IN_PROGRESS', 'COMPLETED'
    };
    // Add to the start, so it's easier to find if we don't cap playerSeries yet
    // Or decide if we want to manage active series differently
    playerSeries.push(activeSeries); // Add new series
    activeSeriesIndex = playerSeries.length - 1;
  }
  return { series: activeSeries, seriesIndex: activeSeriesIndex };
};

/**
 * Gets the current active series for a user or starts a new one.
 * A series is active if it's not "COMPLETED" and has less than 3 games.
 * @param {string} userEmail - The email of the user.
 * @param {object} scoreboard - The current user scoreboard data.
 * @returns {{series: object | null, seriesIndex: number}} The active series and its index.
 */
const getActiveUserSeries = (userEmail, scoreboard) => {
  if (!userEmail || !scoreboard[userEmail]) {
    return { series: null, seriesIndex: -1 };
  }

  const userSeries = scoreboard[userEmail];
  let activeSeries = userSeries.find(
    (s) => s.seriesStatus !== 'COMPLETED' && s.games.length < 3
  );
  let activeSeriesIndex = userSeries.findIndex(
    (s) => s.seriesStatus !== 'COMPLETED' && s.games.length < 3
  );

  if (!activeSeries) {
    activeSeries = {
      seriesId: `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      games: [],
      totalAttempts: 0,
      totalTime: 0,
      seriesStatus: 'IN_PROGRESS', // 'IN_PROGRESS', 'COMPLETED'
    };
    userSeries.push(activeSeries); // Add new series
    activeSeriesIndex = userSeries.length - 1;
  }
  return { series: activeSeries, seriesIndex: activeSeriesIndex };
};


/**
 * Adds a game result to the player's current active series.
 * @param {string} playerName - The name of the player.
 * @param {object} gameResult - The result of the game (e.g., { word, attempts, timeTaken, status }).
 * @param {object} currentScoreboard - The current scoreboard data.
 * @returns {object} The updated scoreboard data.
 */
export const addGameResult = (playerName, gameResult, currentScoreboard) => {
  if (!playerName || !gameResult) return currentScoreboard;

  let scoreboard = { ...currentScoreboard };
  if (!scoreboard[playerName]) {
    scoreboard = initPlayer(playerName, scoreboard);
  }

  const { series, seriesIndex } = getActiveSeries(playerName, scoreboard);

  if (series && series.games.length < 3) {
    series.games.push(gameResult);
    series.totalAttempts += gameResult.attempts;
    series.totalTime += gameResult.timeTaken;

    if (series.games.length === 3) {
      series.seriesStatus = 'COMPLETED';
      // Ensure the series object in the array is updated with the 'COMPLETED' status
      scoreboard[playerName][seriesIndex] = series; 
      // After completing a series, update the top series for the player
      scoreboard[playerName] = updateTopSeriesForPlayer(scoreboard[playerName]);
    } else {
      // Ensure the modified series is updated in the player's array
      scoreboard[playerName][seriesIndex] = series;
    }
    saveScoreboard(scoreboard);
  }
  return scoreboard;
};

/**
 * Sorts series by total attempts (ascending) and then total time (ascending).
 * @param {Array<object>} seriesList - A list of series objects.
 * @returns {Array<object>} The sorted list of series.
 */
const sortSeries = (seriesList) => {
  return seriesList.sort((a, b) => {
    if (a.totalAttempts !== b.totalAttempts) {
      return a.totalAttempts - b.totalAttempts;
    }
    return a.totalTime - b.totalTime;
  });
};

/**
 * Updates a player's list of series to keep only the top N completed series.
 * In-progress series are kept as well, typically one at most.
 * @param {Array<object>} playerSeriesList - The player's current list of series.
 * @returns {Array<object>} The updated list of series for the player.
 */
const updateTopSeriesForPlayer = (playerSeriesList) => {
  const completedSeries = playerSeriesList.filter(s => s.seriesStatus === 'COMPLETED');
  const inProgressSeries = playerSeriesList.filter(s => s.seriesStatus === 'IN_PROGRESS');

  const sortedCompletedSeries = sortSeries(completedSeries);
  const topCompletedSeries = sortedCompletedSeries.slice(0, MAX_SERIES_PER_PLAYER);

  // Combine top completed series with any in-progress series
  // Typically, there should be at most one in-progress series after a series is completed.
  // If an old in-progress series exists (e.g. user abandoned it), this logic might need refinement
  // or a cleanup mechanism. For now, we assume one active or newly completed.
  return [...topCompletedSeries, ...inProgressSeries];
};


/**
 * Retrieves the top series for all players, sorted.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {object} An object where keys are player names and values are their top series.
 */
export const getFormattedScoreboard = (scoreboard) => {
  const formatted = {};
  for (const playerName in scoreboard) {
    // We only want to display completed series that are part of the top N
    // Or, if we want to show an in-progress one, that's a UI decision.
    // For now, let's assume `updateTopSeriesForPlayer` has already filtered and sorted.
    // The `updateTopSeriesForPlayer` should be called when a series is COMPLETED.
    // So, scoreboard[playerName] should already be the list we want to display.
    // We might want to re-sort here just to be sure for display purposes.
    const completedAndSorted = sortSeries(
        scoreboard[playerName].filter(s => s.seriesStatus === 'COMPLETED')
    ).slice(0, MAX_SERIES_PER_PLAYER);
    
    const inProgress = scoreboard[playerName].find(s => s.seriesStatus === 'IN_PROGRESS');

    formatted[playerName] = [...completedAndSorted];
    if (inProgress) {
        // Decide if in-progress series should be displayed on the main scoreboard UI
        // For now, let's add it if it exists, it might be useful for the current player
        // formatted[playerName].push(inProgress); // Or handle separately in UI
    }
  }
  return formatted;
};

/**
 * Gets the current game number in the active series for a player.
 * @param {string} playerName - The name of the player.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {number} The current game number (1, 2, or 3), or 0 if no active series.
 */
export const getCurrentGameNumberInSeries = (playerName, scoreboard) => {
  if (!playerName || !scoreboard[playerName]) {
    return 0;
  }
  const { series } = getActiveSeries(playerName, scoreboard);
  if (series && series.seriesStatus === 'IN_PROGRESS') {
    return series.games.length + 1; // Next game number
  }
  return 0; // Or handle as "no active series" / "series completed"
};

/**
 * Gets the details of the current series for a player.
 * @param {string} playerName - The name of the player.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {object | null} The current series object or null.
 */
export const getCurrentSeriesDetails = (playerName, scoreboard) => {
  if (!playerName || !scoreboard[playerName]) {
    return null;
  }
  const { series } = getActiveSeries(playerName, scoreboard);
  return series;
};

/**
 * Calculates a performance score for a series (lower is better).
 * @param {object} series - The series object.
 * @returns {number} Performance score.
 */
const calculateSeriesScore = (series) => {
  if (!series || series.seriesStatus !== 'COMPLETED') {
    return Infinity; // Incomplete series get worst score
  }
  // Primary: total attempts (lower is better)
  // Secondary: total time (lower is better)
  // Combine into a single score for easier sorting
  return series.totalAttempts * 1000 + series.totalTime;
};

/**
 * Gets the best series for a player.
 * @param {Array<object>} playerSeries - Array of series for a player.
 * @returns {object | null} The best series or null if no completed series.
 */
const getBestSeries = (playerSeries) => {
  const completedSeries = playerSeries.filter(s => s.seriesStatus === 'COMPLETED');
  if (completedSeries.length === 0) return null;
  
  return completedSeries.reduce((best, current) => {
    const bestScore = calculateSeriesScore(best);
    const currentScore = calculateSeriesScore(current);
    return currentScore < bestScore ? current : best;
  });
};

/**
 * Gets global leaderboard rankings.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {Array<object>} Array of player rankings with stats.
 */
export const getGlobalRankings = (scoreboard) => {
  const rankings = [];
  
  for (const playerName in scoreboard) {
    const playerSeries = scoreboard[playerName];
    const completedSeries = playerSeries.filter(s => s.seriesStatus === 'COMPLETED');
    
    if (completedSeries.length === 0) continue; // Skip players with no completed series
    
    const bestSeries = getBestSeries(playerSeries);
    const totalSeriesCompleted = completedSeries.length;
    const averageAttempts = completedSeries.reduce((sum, s) => sum + s.totalAttempts, 0) / completedSeries.length;
    const averageTime = completedSeries.reduce((sum, s) => sum + s.totalTime, 0) / completedSeries.length;
    
    // Calculate fastest single game
    let fastestGame = null;
    let bestSingleGame = null;
    completedSeries.forEach(series => {
      series.games.forEach(game => {
        if (game.status === 'won') {
          if (!fastestGame || game.timeTaken < fastestGame.timeTaken) {
            fastestGame = game;
          }
          if (!bestSingleGame || game.attempts < bestSingleGame.attempts || 
              (game.attempts === bestSingleGame.attempts && game.timeTaken < bestSingleGame.timeTaken)) {
            bestSingleGame = game;
          }
        }
      });
    });
    
    rankings.push({
      playerName,
      bestSeries,
      totalSeriesCompleted,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      averageTime: Math.round(averageTime),
      fastestGame,
      bestSingleGame,
      score: calculateSeriesScore(bestSeries)
    });
  }
  
  // Sort by best series performance (lower score is better)
  rankings.sort((a, b) => a.score - b.score);
  
  // Add rank numbers
  rankings.forEach((player, index) => {
    player.rank = index + 1;
  });
  
  return rankings;
};

/**
 * Gets top performers in different categories.
 * @param {object} scoreboard - The current scoreboard data.
 * @returns {object} Object containing different top performer categories.
 */
export const getTopPerformers = (scoreboard) => {
  const rankings = getGlobalRankings(scoreboard);
  
  if (rankings.length === 0) {
    return {
      bestOverall: null,
      fastestSolver: null,
      mostEfficient: null,
      mostActive: null
    };
  }
  
  // Best overall (already sorted by best series)
  const bestOverall = rankings[0];
  
  // Fastest single game solver
  const fastestSolver = rankings
    .filter(p => p.fastestGame)
    .sort((a, b) => a.fastestGame.timeTaken - b.fastestGame.timeTaken)[0] || null;
  
  // Most efficient (best single game by attempts, then time)
  const mostEfficient = rankings
    .filter(p => p.bestSingleGame)
    .sort((a, b) => {
      if (a.bestSingleGame.attempts !== b.bestSingleGame.attempts) {
        return a.bestSingleGame.attempts - b.bestSingleGame.attempts;
      }
      return a.bestSingleGame.timeTaken - b.bestSingleGame.timeTaken;
    })[0] || null;
  
  // Most active (most completed series)
  const mostActive = rankings
    .sort((a, b) => b.totalSeriesCompleted - a.totalSeriesCompleted)[0];
  
  return {
    bestOverall,
    fastestSolver,
    mostEfficient,
    mostActive
  };
};

// USER-BASED SCOREBOARD FUNCTIONS

/**
 * Adds a game result to the user's current active series.
 * @param {string} userEmail - The email of the user.
 * @param {object} gameResult - The result of the game (e.g., { word, attempts, timeTaken, status }).
 * @param {object} currentScoreboard - The current user scoreboard data.
 * @returns {object} The updated user scoreboard data with completion info.
 */
export const addUserGameResult = (userEmail, gameResult, currentScoreboard) => {
  if (!userEmail || !gameResult) return { scoreboard: currentScoreboard, seriesCompleted: false };

  let scoreboard = { ...currentScoreboard };
  if (!scoreboard[userEmail]) {
    scoreboard = initUser(userEmail, scoreboard);
  }

  const { series, seriesIndex } = getActiveUserSeries(userEmail, scoreboard);

  if (series && series.games.length < 3) {
    series.games.push(gameResult);
    series.totalAttempts += gameResult.attempts;
    series.totalTime += gameResult.timeTaken;

    let seriesCompleted = false;
    let completedSeriesData = null;

    if (series.games.length === 3) {
      series.seriesStatus = 'COMPLETED';
      seriesCompleted = true;
      completedSeriesData = { ...series };
      
      // Ensure the series object in the array is updated with the 'COMPLETED' status
      scoreboard[userEmail][seriesIndex] = series; 
      // After completing a series, update the top series for the user
      scoreboard[userEmail] = updateTopSeriesForPlayer(scoreboard[userEmail]);
    } else {
      // Ensure the modified series is updated in the user's array
      scoreboard[userEmail][seriesIndex] = series;
    }
    saveUserScoreboard(scoreboard);
    
    return { 
      scoreboard, 
      seriesCompleted, 
      completedSeriesData 
    };
  }
  return { scoreboard, seriesCompleted: false };
};

/**
 * Calculates ranking changes and achievements for series completion.
 * @param {string} userEmail - The email of the user.
 * @param {object} previousScoreboard - Scoreboard before series completion.
 * @param {object} currentScoreboard - Scoreboard after series completion.
 * @param {object} userProfiles - User profiles for display names.
 * @returns {object} Ranking change data for achievement display.
 */
export const calculateRankingAchievements = (userEmail, previousScoreboard, currentScoreboard, userProfiles = {}) => {
  // Get rankings before and after
  const previousRankings = getUserGlobalRankings(previousScoreboard, userProfiles);
  const currentRankings = getUserGlobalRankings(currentScoreboard, userProfiles);
  
  // Find user's positions
  const previousUserRank = previousRankings.find(r => r.userEmail === userEmail);
  const currentUserRank = currentRankings.find(r => r.userEmail === userEmail);
  
  const previousRank = previousUserRank ? previousUserRank.rank : 0;
  const currentRank = currentUserRank ? currentUserRank.rank : 0;
  const positionChange = previousRank > 0 ? previousRank - currentRank : 0;
  
  // Calculate achievements
  const achievedTopThree = currentRank <= 3 && currentRank > 0;
  const wasTopThreeBefore = previousRank <= 3 && previousRank > 0;
  const newTopThreeAchievement = achievedTopThree && !wasTopThreeBefore;
  
  // Check if this is user's first completed series
  const userSeries = currentScoreboard[userEmail] || [];
  const completedSeries = userSeries.filter(s => s.seriesStatus === 'COMPLETED');
  const isFirstSeries = completedSeries.length === 1;
  
  // Check if this is a new personal best
  const isNewPersonalBest = currentUserRank && 
    (!previousUserRank || currentUserRank.score < previousUserRank.score);
  
  // Calculate how many players were beaten
  const totalPlayers = currentRankings.length;
  const beatPlayers = Math.max(0, totalPlayers - currentRank);
  
  return {
    previousRank,
    currentRank,
    positionChange,
    beatPlayers,
    isNewPersonalBest,
    achievedTopThree,
    newTopThreeAchievement,
    isFirstSeries,
    totalPlayers
  };
};

/**
 * Gets the current game number in the active series for a user.
 * @param {string} userEmail - The email of the user.
 * @param {object} scoreboard - The current user scoreboard data.
 * @returns {number} The current game number (1, 2, or 3), or 0 if no active series.
 */
export const getCurrentUserGameNumberInSeries = (userEmail, scoreboard) => {
  if (!userEmail || !scoreboard[userEmail]) {
    return 0;
  }
  const { series } = getActiveUserSeries(userEmail, scoreboard);
  if (series && series.seriesStatus === 'IN_PROGRESS') {
    return series.games.length + 1; // Next game number
  }
  return 0; // Or handle as "no active series" / "series completed"
};

/**
 * Gets the details of the current series for a user.
 * @param {string} userEmail - The email of the user.
 * @param {object} scoreboard - The current user scoreboard data.
 * @returns {object | null} The current series object or null.
 */
export const getCurrentUserSeriesDetails = (userEmail, scoreboard) => {
  if (!userEmail || !scoreboard[userEmail]) {
    return null;
  }
  const { series } = getActiveUserSeries(userEmail, scoreboard);
  return series;
};

/**
 * Gets user-based global leaderboard rankings with user names from profiles.
 * @param {object} scoreboard - The current user scoreboard data.
 * @param {object} userProfiles - User profiles data for getting display names.
 * @returns {Array<object>} Array of user rankings with stats.
 */
export const getUserGlobalRankings = (scoreboard, userProfiles = {}) => {
  const rankings = [];
  
  for (const userEmail in scoreboard) {
    const userSeries = scoreboard[userEmail];
    const completedSeries = userSeries.filter(s => s.seriesStatus === 'COMPLETED');
    
    if (completedSeries.length === 0) continue; // Skip users with no completed series
    
    const bestSeries = getBestSeries(userSeries);
    const totalSeriesCompleted = completedSeries.length;
    const averageAttempts = completedSeries.reduce((sum, s) => sum + s.totalAttempts, 0) / completedSeries.length;
    const averageTime = completedSeries.reduce((sum, s) => sum + s.totalTime, 0) / completedSeries.length;
    
    // Calculate fastest single game
    let fastestGame = null;
    let bestSingleGame = null;
    completedSeries.forEach(series => {
      series.games.forEach(game => {
        if (game.status === 'won') {
          if (!fastestGame || game.timeTaken < fastestGame.timeTaken) {
            fastestGame = game;
          }
          if (!bestSingleGame || game.attempts < bestSingleGame.attempts || 
              (game.attempts === bestSingleGame.attempts && game.timeTaken < bestSingleGame.timeTaken)) {
            bestSingleGame = game;
          }
        }
      });
    });
    
    // Get user display name from profiles
    const userProfile = userProfiles[userEmail];
    const displayName = userProfile ? userProfile.fullName : userEmail;
    
    rankings.push({
      userEmail,
      playerName: displayName, // For compatibility with existing components
      bestSeries,
      totalSeriesCompleted,
      averageAttempts: Math.round(averageAttempts * 10) / 10,
      averageTime: Math.round(averageTime),
      fastestGame,
      bestSingleGame,
      score: calculateSeriesScore(bestSeries)
    });
  }
  
  // Sort by best series performance (lower score is better)
  rankings.sort((a, b) => a.score - b.score);
  
  // Add rank numbers
  rankings.forEach((user, index) => {
    user.rank = index + 1;
  });
  
  return rankings;
};

/**
 * Gets user-based top performers in different categories.
 * @param {object} scoreboard - The current user scoreboard data.
 * @param {object} userProfiles - User profiles data for getting display names.
 * @returns {object} Object containing different top performer categories.
 */
export const getUserTopPerformers = (scoreboard, userProfiles = {}) => {
  const rankings = getUserGlobalRankings(scoreboard, userProfiles);
  
  if (rankings.length === 0) {
    return {
      bestOverall: null,
      fastestSolver: null,
      mostEfficient: null,
      mostActive: null
    };
  }
  
  // Best overall (already sorted by best series)
  const bestOverall = rankings[0];
  
  // Fastest single game solver
  const fastestSolver = rankings
    .filter(p => p.fastestGame)
    .sort((a, b) => a.fastestGame.timeTaken - b.fastestGame.timeTaken)[0] || null;
  
  // Most efficient (best single game by attempts, then time)
  const mostEfficient = rankings
    .filter(p => p.bestSingleGame)
    .sort((a, b) => {
      if (a.bestSingleGame.attempts !== b.bestSingleGame.attempts) {
        return a.bestSingleGame.attempts - b.bestSingleGame.attempts;
      }
      return a.bestSingleGame.timeTaken - b.bestSingleGame.timeTaken;
    })[0] || null;
  
  // Most active (most completed series)
  const mostActive = rankings
    .sort((a, b) => b.totalSeriesCompleted - a.totalSeriesCompleted)[0];
  
  return {
    bestOverall,
    fastestSolver,
    mostEfficient,
    mostActive
  };
};

/**
 * Gets formatted user scoreboard for display.
 * @param {object} scoreboard - The current user scoreboard data.
 * @param {object} userProfiles - User profiles data for getting display names.
 * @returns {object} An object where keys are display names and values are their top series.
 */
export const getFormattedUserScoreboard = (scoreboard, userProfiles = {}) => {
  const formatted = {};
  
  for (const userEmail in scoreboard) {
    const userProfile = userProfiles[userEmail];
    const displayName = userProfile ? userProfile.fullName : userEmail;
    
    const completedAndSorted = sortSeries(
        scoreboard[userEmail].filter(s => s.seriesStatus === 'COMPLETED')
    ).slice(0, MAX_SERIES_PER_PLAYER);
    
    const inProgress = scoreboard[userEmail].find(s => s.seriesStatus === 'IN_PROGRESS');

    formatted[displayName] = [...completedAndSorted];
    if (inProgress) {
        // Decide if in-progress series should be displayed on the main scoreboard UI
        // For now, let's add it if it exists, it might be useful for the current player
        // formatted[displayName].push(inProgress); // Or handle separately in UI
    }
  }
  return formatted;
};
