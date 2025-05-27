import { useState, useEffect, useCallback } from 'react';
import {
  getActiveUserEmail,
  setActiveUserEmail,
  getUserProfile,
  createUserProfile,
  saveUserProfile,
  emailExists,
  isValidEmail,
  isValidName,
  addGameToProfile,
  updateLastPlayed
} from '../utils/userProfileUtils';

const useUserProfile = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load active user on mount
  useEffect(() => {
    const loadActiveUser = () => {
      const activeEmail = getActiveUserEmail();
      if (activeEmail) {
        const profile = getUserProfile(activeEmail);
        if (profile) {
          setActiveUser(profile);
        } else {
          // Active user email exists but profile is missing, clear it
          setActiveUserEmail(null);
        }
      }
      setIsLoading(false);
    };

    loadActiveUser();
  }, []);

  /**
   * Logs in an existing user by email.
   * @param {string} email - User email
   * @returns {boolean} True if login successful
   */
  const loginUser = useCallback((email) => {
    const profile = getUserProfile(email);
    if (profile) {
      setActiveUser(profile);
      setActiveUserEmail(email);
      updateLastPlayed(email);
      return true;
    }
    return false;
  }, []);

  /**
   * Signs up a new user with email and full name.
   * @param {string} email - User email
   * @param {string} fullName - User's full name
   * @returns {object} Result object with success status and message
   */
  const signUpUser = useCallback((email, fullName) => {
    // Validate inputs
    if (!isValidEmail(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!isValidName(fullName)) {
      return { success: false, message: 'Please enter a valid full name (at least 2 characters).' };
    }

    // Check if email already exists
    if (emailExists(email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Create new profile
    const newProfile = createUserProfile(email, fullName);
    saveUserProfile(newProfile);
    
    // Set as active user
    setActiveUser(newProfile);
    setActiveUserEmail(newProfile.email);

    return { success: true, message: 'Account created successfully!' };
  }, []);

  /**
   * Logs out the current user.
   */
  const logoutUser = useCallback(() => {
    setActiveUser(null);
    setActiveUserEmail(null);
  }, []);

  /**
   * Switches to a different user profile.
   * @param {string} email - Email of user to switch to
   * @returns {boolean} True if switch successful
   */
  const switchUser = useCallback((email) => {
    return loginUser(email);
  }, [loginUser]);

  /**
   * Records a game result for the active user.
   * @param {object} gameResult - Game result object
   */
  const recordGameResult = useCallback((gameResult) => {
    if (activeUser) {
      addGameToProfile(activeUser.email, gameResult);
      // Refresh the active user data to reflect the updated stats
      const updatedProfile = getUserProfile(activeUser.email);
      if (updatedProfile) {
        setActiveUser(updatedProfile);
      }
    }
  }, [activeUser]);

  /**
   * Refreshes the active user profile data.
   */
  const refreshActiveUser = useCallback(() => {
    if (activeUser) {
      const updatedProfile = getUserProfile(activeUser.email);
      if (updatedProfile) {
        setActiveUser(updatedProfile);
      }
    }
  }, [activeUser]);

  return {
    // State
    activeUser,
    isLoading,
    isLoggedIn: !!activeUser,

    // Actions
    loginUser,
    signUpUser,
    logoutUser,
    switchUser,
    recordGameResult,
    refreshActiveUser
  };
};

export default useUserProfile;
