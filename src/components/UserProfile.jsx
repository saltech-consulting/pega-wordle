import React, { useState } from 'react';
import { getAllUserEmails, getUserProfile } from '../utils/userProfileUtils';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const UserProfile = ({ activeUser, onSwitchUser, onLogout }) => {
  const [showSwitchProfile, setShowSwitchProfile] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState([]);

  // Load available profiles when switch profile is opened
  const handleShowSwitchProfile = () => {
    const emails = getAllUserEmails();
    const profiles = emails
      .filter(email => email !== activeUser.email)
      .map(email => getUserProfile(email))
      .filter(profile => profile !== null);
    
    setAvailableProfiles(profiles);
    setShowSwitchProfile(true);
  };

  const handleSwitchToProfile = (email) => {
    onSwitchUser(email);
    setShowSwitchProfile(false);
  };

  const handleCancelSwitch = () => {
    setShowSwitchProfile(false);
    setAvailableProfiles([]);
  };

  if (showSwitchProfile) {
    return (
      <div className="user-profile switch-profile-mode">
        <h3>Switch Profile</h3>
        
        {availableProfiles.length === 0 ? (
          <div className="no-profiles">
            <p>No other profiles available.</p>
            <button onClick={handleCancelSwitch} className="cancel-button">
              Back
            </button>
          </div>
        ) : (
          <div className="profile-list">
            <p>Select a profile to switch to:</p>
            {availableProfiles.map(profile => (
              <div key={profile.email} className="profile-option">
                <div className="profile-info">
                  <div className="profile-name">{profile.fullName}</div>
                  <div className="profile-email">{profile.email}</div>
                  <div className="profile-stats">
                    {profile.totalGamesPlayed} games played
                    {profile.bestGames.length > 0 && (
                      <span> • Best: {profile.bestGames[0].attempts} attempts</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => handleSwitchToProfile(profile.email)}
                  className="switch-button"
                >
                  Switch
                </button>
              </div>
            ))}
            <div className="switch-actions">
              <button onClick={handleCancelSwitch} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="user-info">
          <h3>{activeUser.fullName}</h3>
          <p className="user-email">{activeUser.email}</p>
        </div>
        <div className="profile-actions">
          <button 
            onClick={handleShowSwitchProfile}
            className="switch-profile-button"
            title="Switch to another profile"
          >
            Switch Profile
          </button>
          <button 
            onClick={onLogout}
            className="logout-button"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-label">Games Played:</span>
          <span className="stat-value">{activeUser.totalGamesPlayed}</span>
        </div>
        
        {activeUser.bestGames.length > 0 && (
          <div className="best-games">
            <h4>Best Games</h4>
            <div className="best-games-list">
              {activeUser.bestGames.map((game, index) => (
                <div key={index} className="best-game-item">
                  <div className="game-rank">#{index + 1}</div>
                  <div className="game-details">
                    <div className="game-word">{game.word}</div>
                    <div className="game-stats">
                      {game.attempts} attempts • {formatTime(game.timeTaken)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeUser.bestGames.length === 0 && (
          <div className="no-best-games">
            <p>No completed games yet. Win a game to see your best performances!</p>
          </div>
        )}
      </div>

      <div className="profile-footer">
        <p className="member-since">
          Member since {new Date(activeUser.createdAt).toLocaleDateString()}
        </p>
        {activeUser.lastPlayedAt && (
          <p className="last-played">
            Last played {new Date(activeUser.lastPlayedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
