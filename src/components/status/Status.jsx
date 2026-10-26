import React from 'react';
import './Status.css';
import comment from "../../assets/comment.svg";
import like from "../../assets/like.svg";

export default function Status() {
  return (
    <div className="event-details-card">
      {/* Header */}
      <div className="event-header">
        <h3>Event details</h3>
        <button className="close-btn">&times;</button>
      </div>

      {/* Banner Image */}
      <div className="event-banner">
        <span className="badge-weekend">THIS WEEKEND</span>
        <div className="date-badge">
          <span className="month">OCT</span>
          <span className="day">24</span>
        </div>
      </div>

      {/* Content */}
      <div className="event-content">
        <h2>Koduyathra - Faculty of Computing</h2>
        
        <div className="event-meta">
          <div className="meta-item">
            <small>DATE</small>
            <p>Sunday, October 24</p>
          </div>
          <div className="meta-item">
            <small>TIME</small>
            <p>12:00 PM</p>
          </div>
          <div className="meta-item">
            <small>LOCATION</small>
            <p>J. W. Dayananda Somasundara Audi</p>
          </div>
        </div>

        <p className="event-description">
          Koduyathra is the talent show of the Faculty of Computing, celebrating the creativity, talents, and hidden abilities of our students. It is a stage where music, dance, and many more talents to create unforgettable memories. One stage, countless talents, and a thousand unforgettable memories — this is KODUYATHRA! 🔥
        </p>

        {/* Stats */}
        <div className="event-stats">
          <span>48 neighbors loved this</span>
          <span>12 comments</span>
        </div>

        {/* Actions */}
        <div className="event-actions">
          <button className="action-btn">
            <img src={like} alt="like" style={{ width: '16px', height: '16px' }} />
            Love this
          </button>
          <button className="action-btn">
            <img src={comment} alt="comment" style={{ width: '16px', height: '16px' }} />
            Say something
          </button>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comment-bubble">
            <strong>Maya Chen</strong>
            <p>This sounds like the perfect Sunday. I will bring something to share!</p>
          </div>
          <div className="comment-bubble">
            <strong>Jamie Lewis</strong>
            <p>Count me in! Looking forward to meeting everyone.</p>
          </div>
          
          <div className="comment-input-box">
            <input type="text" placeholder="Write a comment..." />
          </div>
        </div>
      </div>
    </div>
  );
}