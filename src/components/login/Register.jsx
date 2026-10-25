import React from 'react';
import './Register.css';

function Register() {

    
  return (
    <div className="register-container">
      {/* Top Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon-bg">
            <span className="logo-icon">🌱</span>
          </div>
          <span className="logo-text">Mahagedara</span>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="main-content">
        <div className="register-card">
          <h2 className="register-title">Register</h2>

          <form className="register-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" placeholder="Enter your email address" required />
              </div>
            </div>

            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input type="text" placeholder="Choose a username" required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" placeholder="Create a password" required />
                <span className="input-icon-right">👁️</span>
              </div>
              <small className="hint-text">Use at least 8 characters.</small>
            </div>

            <div className="button-group">
              <button type="button" className="btn btn-login">Login</button>
              <button type="submit" className="btn btn-register">
                Register <span>➔</span>
              </button>
            </div>
          </form>

          <div className="terms-policy">
            By registering, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2026 Mahagedara
      </footer>
    </div>
  );
};

export default Register;