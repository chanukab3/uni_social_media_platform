import React from 'react';
import './CreateEvent.css';
import calendar from "../../assets/calendar.svg";
import clock from "../../assets/clock.svg";

export default function CreateEvent() {
  return (
    <div className="create-event-card">
      <div className="create-event-header">
        <h3>Create Event</h3>
        <button className="close-btn">&times;</button>
      </div>

      <div className="form-group">
        <label>Event Name</label>
        <input type="text" className="form-input" placeholder="e.g. Koduyathra" />
      </div>

      <div className="form-row">
  <div className="form-group">
    <label>Date</label>
    <div className="input-icon-box">
      <img src={calendar} alt="date" className="input-icon" />
      <input type="text" className="form-input with-icon" placeholder="2026-10-10" />
    </div>
  </div>
  
  <div className="form-group">
    <label>Time</label>
    <div className="input-icon-box">
      <img src={clock} alt="time" className="input-icon" />
      <input type="text" className="form-input with-icon" placeholder="06.00 PM" />
    </div>
  </div>
</div>

      <div className="form-group">
        <label>Location</label>
        <input type="text" className="form-input" placeholder="e.g. J. W. Dayananda Somasundara Auditorium" />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea className="form-input form-textarea" rows="3" placeholder="Describe the event..."></textarea>
      </div>

      <div className="form-group">
        <label>Upload Image</label>
        <div className="upload-box">
          <p className="upload-text">Drag & drop image here</p>
          <p className="upload-subtext">or Browse files</p>
          <p className="upload-formats">PNG, JPG up to 5MB</p>
        </div>
      </div>

      <button className="post-submit-btn">Post</button>
    </div>
  );
}