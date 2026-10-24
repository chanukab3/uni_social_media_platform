import React, { useState } from 'react';
import './ForgetPassword.css';

function ForgetPassword() {
  // This state keeps track of the email address the user types
  const [email, setEmail] = useState('');

  // This function runs when the user clicks the button
  const handleSendCode = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    console.log("Sending code to:", email);
  };

  return (
    <div className="page-wrapper">
      {/* Top Left Logo Area */}
      <header className="header">
        <div className="logo-box">
          <span className="logo-icon">🌱</span>
        </div>
        <h1 className="brand-name">Mahagedara</h1>
      </header>

      {/* Center Card Area */}
      <main className="main-content">
        <div className="card">
          <h2 className="card-title">Forget password</h2>
          
          <form onSubmit={handleSendCode} className="form-container">
            <label className="input-label" htmlFor="emailInput">Email</label>
            
            <div className="input-wrapper">
              <span className="mail-icon">✉️</span>
              <input
                type="email"
                id="emailInput"
                className="email-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Send Verification Code <span className="arrow-icon">➔</span>
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Left Footer */}
      <footer className="footer">
        <p>© 2026 Mahagedara</p>
      </footer>
    </div>
  );
}

export default ForgetPassword;