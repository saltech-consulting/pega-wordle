const USER_PROFILES_KEY = 'pegaWordleUserProfiles';
const ACTIVE_USER_KEY = 'pegaWordleActiveUser';

/**
 * Loads all user profiles from localStorage.
 * @returns {object} Object with email as key and profile data as value
 */
export const loadUserProfiles = () => {
  try {
    const storedProfiles = localStorage.getItem(USER_PROFILES_KEY);
    return storedProfiles ? JSON.parse(storedProfiles) : {};
  } catch (error) {
    console.error("Error loading user profiles from localStorage:", error);
    return {};
  }
};

/**
 * Saves all user profiles to localStorage.
 * @param {object} profiles - The profiles data to save
 */
export const saveUserProfiles = (profiles) => {
  try {
    localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("Error saving user profiles to localStorage:", error);
  }
};

/**
 * Gets the currently active user email from localStorage.
 * @returns {string|null} Active user email or null
 */
export const getActiveUserEmail = () => {
  try {
    return localStorage.getItem(ACTIVE_USER_KEY);
  } catch (error) {
    console.error("Error getting active user from localStorage:", error);
    return null;
  }
};

/**
 * Sets the active user email in localStorage.
 * @param {string} email - User email to set as active
 */
export const setActiveUserEmail = (email) => {
  try {
    if (email) {
      localStorage.setItem(ACTIVE_USER_KEY, email);
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (error) {
    console.error("Error setting active user in localStorage:", error);
  }
};

/**
 * Creates a new user profile.
 * @param {string} email - User email (will be normalized to lowercase)
 * @param {string} fullName - User's full name
 * @returns {object} The created user profile
 */
export const createUserProfile = (email, fullName) => {
  const normalizedEmail = email.toLowerCase().trim();
  const timestamp = Date.now();
  
  return {
    email: normalizedEmail,
    fullName: fullName.trim(),
    createdAt: timestamp,
    lastPlayedAt: timestamp,
    totalGamesPlayed: 0,
    bestGames: [] // Top 3 games ranked by attempts, then time
  };
};

/**
 * Gets a user profile by email (case-insensitive).
 * @param {string} email - User email
 * @returns {object|null} User profile or null if not found
 */
export const getUserProfile = (email) => {
  const profiles = loadUserProfiles();
  const normalizedEmail = email.toLowerCase().trim();
  return profiles[normalizedEmail] || null;
};

/**
 * Saves or updates a user profile.
 * @param {object} profile - User profile to save
 * @returns {object} Updated profiles object
 */
export const saveUserProfile = (profile) => {
  const profiles = loadUserProfiles();
  profiles[profile.email] = profile;
  saveUserProfiles(profiles);
  return profiles;
};

/**
 * Gets all user emails for autocomplete.
 * @returns {string[]} Array of user emails
 */
export const getAllUserEmails = () => {
  const profiles = loadUserProfiles();
  return Object.keys(profiles);
};

/**
 * Checks if an email exists (case-insensitive).
 * @param {string} email - Email to check
 * @returns {boolean} True if email exists
 */
export const emailExists = (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const profiles = loadUserProfiles();
  return normalizedEmail in profiles;
};

/**
 * Updates user's last played timestamp.
 * @param {string} email - User email
 */
export const updateLastPlayed = (email) => {
  const profile = getUserProfile(email);
  if (profile) {
    profile.lastPlayedAt = Date.now();
    saveUserProfile(profile);
  }
};

/**
 * Adds a game result to user's profile and updates best games.
 * @param {string} email - User email
 * @param {object} gameResult - Game result object
 */
export const addGameToProfile = (email, gameResult) => {
  const profile = getUserProfile(email);
  if (!profile) return;

  // Update total games played
  profile.totalGamesPlayed += 1;
  profile.lastPlayedAt = Date.now();

  // Only track won games in best games
  if (gameResult.status === 'won') {
    // Add to best games
    profile.bestGames.push({
      word: gameResult.word,
      attempts: gameResult.attempts,
      timeTaken: gameResult.timeTaken,
      timestamp: Date.now()
    });

    // Sort by attempts (ascending), then by time (ascending)
    profile.bestGames.sort((a, b) => {
      if (a.attempts !== b.attempts) {
        return a.attempts - b.attempts;
      }
      return a.timeTaken - b.timeTaken;
    });

    // Keep only top 3
    profile.bestGames = profile.bestGames.slice(0, 3);
  }

  saveUserProfile(profile);
};

/**
 * Validates email format.
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates full name.
 * @param {string} name - Name to validate
 * @returns {boolean} True if name is valid
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

/**
 * Gets user profile statistics.
 * @param {string} email - User email
 * @returns {object|null} User statistics or null
 */
export const getUserStats = (email) => {
  const profile = getUserProfile(email);
  if (!profile) return null;

  return {
    fullName: profile.fullName,
    email: profile.email,
    totalGamesPlayed: profile.totalGamesPlayed,
    bestGames: profile.bestGames,
    memberSince: new Date(profile.createdAt).toLocaleDateString(),
    lastPlayed: profile.lastPlayedAt ? new Date(profile.lastPlayedAt).toLocaleDateString() : 'Never'
  };
};
