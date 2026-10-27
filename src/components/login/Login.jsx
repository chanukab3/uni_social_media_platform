import Register from "./Register";
import ForgetPassword from './ForgetPassword';

import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sprout 
} from 'lucide-react';
import './login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
  };

  return (<>
    <Register/>
    
    <div className="login-container">
      {/* Top Header / Logo */}
      <header className="login-header">
        <div className="logo-badge">
          <Sprout className="logo-icon" />
        </div>
        <span className="brand-name">Mahagedara</span>
      </header>

      {/* Main Login Card */}
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">Login</h1>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username / Email Field */}
            <div className="form-group">
              <label htmlFor="username">Username or email</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password-container">
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button type="submit" className="btn-primary">
                Login <ArrowRight size={16} />
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => console.log('Navigate to register')}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>© 2026 Mahagedara</p>
      </footer>
    </div>
    <ForgetPassword/>
    </>
  );
}