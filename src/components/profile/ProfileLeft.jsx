import React from 'react';
import './ProfileLeft.css';

export default function ProfileLeft() {
  return (
    <aside className="profile-left-container">
      {/* Brand Logo Header */}
      <div className="brand-header">
        <div className="brand-icon-box">
          <svg className="brand-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <span className="brand-title">MahaGedara</span>
      </div>

      {/* Image Box */}
      <div className="avatar-box">
        <svg className="placeholder-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>

      {/* Bio Card */}
      <div className="info-card bio-card">
        <span className="bio-label"><strong>Bio</strong></span>
        <div className="bio-content">
          <p>22</p>
          <p>FOC 23/24</p>
          <p>Department of Software Engineering</p>
          <p>Female</p>

        </div>
      </div>

      {/* Stats Card */}
      <div className="info-card stats-card">
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-num">2.3k</span>
            <span className="stat-text">Friends</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">169</span>
            <span className="stat-text">Following</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">9.1k</span>
            <span className="stat-text">Followers</span>
          </div>
        </div>
        <button className="view-all-btn">View All</button>
      </div>

      {/* Actions Card  */}
      <div className="info-card actions-card actions-card-wrapper">
        <button className="action-button"><strong>Settings</strong></button>
        <button className="action-button"><strong>Log out</strong></button>
      </div>
    </aside>
  );
}