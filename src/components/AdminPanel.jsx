import React, { useState, useEffect } from 'react';
import { 
  loadUserProfiles, 
  saveUserProfiles,
  getAllUserEmails 
} from '../utils/userProfileUtils';
import {
  loadUserScoreboard,
  saveUserScoreboard,
  getUserGlobalRankings
} from '../utils/scoreboardUtils';

const AdminPanel = ({ onClose, activeUserEmail }) => {
  const [users, setUsers] = useState({});
  const [scoreboards, setScoreboards] = useState({});
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedUsers = loadUserProfiles();
    const loadedScoreboards = loadUserScoreboard();
    setUsers(loadedUsers);
    setScoreboards(loadedScoreboards);
    calculateStats(loadedUsers, loadedScoreboards);
  };

  const calculateStats = (usersData, scoreboardsData) => {
    const userCount = Object.keys(usersData).length;
    let totalGames = 0;
    let totalSeries = 0;
    let completedSeries = 0;
    let activeUsers = 0;

    Object.entries(scoreboardsData).forEach(([email, userScoreboard]) => {
      if (Array.isArray(userScoreboard) && userScoreboard.length > 0) {
        activeUsers++;
        userScoreboard.forEach(series => {
          totalSeries++;
          if (series.games) {
            totalGames += series.games.length;
          }
          if (series.seriesStatus === 'COMPLETED') {
            completedSeries++;
          }
        });
      }
    });

    setStats({
      userCount,
      activeUsers,
      totalGames,
      totalSeries,
      completedSeries
    });
  };

  const handleDeleteUser = (email) => {
    if (email === activeUserEmail) {
      alert("Cannot delete the currently logged-in user!");
      return;
    }

    setConfirmAction({
      type: 'delete',
      target: email,
      message: `Delete user ${users[email]?.fullName} (${email})?`
    });
  };

  const handleDeleteSelected = () => {
    const selectedEmails = Array.from(selectedUsers);
    if (selectedEmails.includes(activeUserEmail)) {
      alert("Cannot delete the currently logged-in user!");
      return;
    }

    if (selectedEmails.length === 0) {
      alert("No users selected");
      return;
    }

    setConfirmAction({
      type: 'deleteMultiple',
      target: selectedEmails,
      message: `Delete ${selectedEmails.length} selected users?`
    });
  };

  const handleClearAllData = () => {
    setConfirmAction({
      type: 'clearAll',
      message: 'This will delete ALL users and scores. Are you sure?'
    });
  };

  const handleClearScores = () => {
    setConfirmAction({
      type: 'clearScores',
      message: 'This will reset all leaderboard data. Are you sure?'
    });
  };

  const executeAction = () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'delete': {
        const updatedUsers = { ...users };
        const updatedScoreboards = { ...scoreboards };
        delete updatedUsers[confirmAction.target];
        delete updatedScoreboards[confirmAction.target];
        saveUserProfiles(updatedUsers);
        saveUserScoreboard(updatedScoreboards);
        break;
      }
      
      case 'deleteMultiple': {
        const updatedUsers = { ...users };
        const updatedScoreboards = { ...scoreboards };
        confirmAction.target.forEach(email => {
          delete updatedUsers[email];
          delete updatedScoreboards[email];
        });
        saveUserProfiles(updatedUsers);
        saveUserScoreboard(updatedScoreboards);
        setSelectedUsers(new Set());
        break;
      }
      
      case 'clearAll': {
        localStorage.removeItem('pega-wordle-users');
        localStorage.removeItem('pega-wordle-user-scoreboards');
        localStorage.removeItem('pega-wordle-active-user');
        window.location.reload(); // Force reload to reset app
        break;
      }
      
      case 'clearScores': {
        saveUserScoreboard({});
        break;
      }
    }

    setConfirmAction(null);
    loadData(); // Reload data
  };

  const toggleUserSelection = (email) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    setSelectedUsers(new Set(Object.keys(users).filter(email => email !== activeUserEmail)));
  };

  const selectNone = () => {
    setSelectedUsers(new Set());
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const rankings = getUserGlobalRankings(scoreboards, users);

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>🔒 Admin Panel</h2>
          <button onClick={onClose} className="admin-close-button">×</button>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`admin-tab ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            Actions
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && stats && (
            <div className="admin-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.userCount}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.activeUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalGames}</div>
                  <div className="stat-label">Games Played</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.completedSeries}</div>
                  <div className="stat-label">Series Completed</div>
                </div>
              </div>

              <h3>Top Performers</h3>
              <div className="admin-rankings">
                {rankings.slice(0, 5).map((user, index) => (
                  <div key={user.userEmail} className="ranking-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{user.playerName}</span>
                    <span className="score">{user.totalSeriesCompleted} series</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-users">
              <div className="user-controls">
                <button onClick={selectAll} className="control-button">Select All</button>
                <button onClick={selectNone} className="control-button">Select None</button>
                <button onClick={handleDeleteSelected} className="control-button danger">
                  Delete Selected ({selectedUsers.size})
                </button>
              </div>

              <div className="user-list">
                {Object.entries(users).map(([email, user]) => {
                  const userScoreboard = scoreboards[email] || [];
                  const gamesPlayed = userScoreboard.reduce((sum, series) => 
                    sum + (series.games?.length || 0), 0);
                  const isCurrentUser = email === activeUserEmail;

                  return (
                    <div key={email} className={`user-item ${isCurrentUser ? 'current-user' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(email)}
                        onChange={() => toggleUserSelection(email)}
                        disabled={isCurrentUser}
                      />
                      <div className="user-info">
                        <div className="user-name">
                          {user.fullName} {isCurrentUser && '(Current User)'}
                        </div>
                        <div className="user-email">{email}</div>
                        <div className="user-stats">
                          Games: {gamesPlayed} | Joined: {formatDate(user.createdAt)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(email)}
                        className="delete-button"
                        disabled={isCurrentUser}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="admin-actions">
              <div className="action-section">
                <h3>Data Management</h3>
                <button onClick={handleClearScores} className="action-button warning">
                  Clear All Scores
                  <span className="action-desc">Reset leaderboard, keep users</span>
                </button>
                <button onClick={handleClearAllData} className="action-button danger">
                  Clear All Data
                  <span className="action-desc">Delete everything and restart</span>
                </button>
              </div>

              <div className="action-section">
                <h3>Export Data</h3>
                <button 
                  onClick={() => {
                    const data = {
                      users,
                      scoreboards,
                      exportDate: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], 
                      { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `pega-wordle-backup-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="action-button"
                >
                  Export All Data
                  <span className="action-desc">Download backup JSON file</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {confirmAction && (
          <div className="confirm-dialog">
            <div className="confirm-content">
              <p>{confirmAction.message}</p>
              <div className="confirm-buttons">
                <button onClick={() => setConfirmAction(null)} className="cancel-button">
                  Cancel
                </button>
                <button onClick={executeAction} className="confirm-button danger">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;