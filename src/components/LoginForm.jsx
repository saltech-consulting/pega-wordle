import React, { useState, useEffect, useRef } from 'react';
import { getAllUserEmails, emailExists, isValidEmail, isValidName } from '../utils/userProfileUtils';

const LoginForm = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load existing emails for autocomplete
  useEffect(() => {
    const existingEmails = getAllUserEmails();
    setSuggestions(existingEmails);
  }, []);

  // Filter suggestions based on email input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(email.toLowerCase()) && suggestion !== email
  );

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    setShowNameInput(false);
    setFullName('');
    setSelectedSuggestionIndex(-1);

    // Show suggestions if there's input and matches
    if (value.trim() && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle email input blur
  const handleEmailBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  };

  // Handle email input focus
  const handleEmailFocus = () => {
    if (email.trim() && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setEmail(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    emailInputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      // Validate email
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }

      // Check if user exists
      if (emailExists(email)) {
        // Existing user - login
        const success = onLogin(email);
        if (!success) {
          setError('Failed to log in. Please try again.');
        }
      } else {
        // New user - show name input or sign up
        if (!showNameInput) {
          setShowNameInput(true);
          setTimeout(() => {
            nameInputRef.current?.focus();
          }, 100);
          return;
        }

        // Validate name
        if (!isValidName(fullName)) {
          setError('Please enter a valid full name (at least 2 characters).');
          return;
        }

        // Sign up new user
        const result = onSignUp(email, fullName);
        if (!result.success) {
          setError(result.message);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login/signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle name input change
  const handleNameChange = (e) => {
    setFullName(e.target.value);
    setError('');
  };

  // Handle back button (when in name input mode)
  const handleBack = () => {
    setShowNameInput(false);
    setFullName('');
    setError('');
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="login-form-container">
      <div className="login-form">
        <h2>Welcome to Pega-Wordle</h2>
        <p className="login-subtitle">
          {showNameInput 
            ? 'Create your account to start playing' 
            : 'Enter your email to continue'
          }
        </p>

        <form onSubmit={handleSubmit}>
          {!showNameInput ? (
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="autocomplete-container">
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  onFocus={handleEmailFocus}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  autoFocus
                  disabled={isSubmitting}
                  required
                />
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className="suggestions-dropdown">
                    {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        className={`suggestion-item ${
                          index === selectedSuggestionIndex ? 'selected' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                ref={nameInputRef}
                type="text"
                id="fullName"
                value={fullName}
                onChange={handleNameChange}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={isSubmitting}
                required
              />
              <div className="signup-info">
                <p>Creating account for: <strong>{email}</strong></p>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            {showNameInput && (
              <button
                type="button"
                onClick={handleBack}
                className="back-button"
                disabled={isSubmitting}
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || (!email.trim() || (showNameInput && !fullName.trim()))}
            >
              {isSubmitting ? 'Please wait...' : (
                showNameInput ? 'Create Account' : (
                  emailExists(email) ? 'Continue' : 'Next'
                )
              )}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>All gameplay requires an account. No anonymous play allowed.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
