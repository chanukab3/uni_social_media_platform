
import { useState } from "react";
// SUPABASE: uncomment after pulling your teammate's changes
// import { supabase } from "../../lib/supabaseClient";
import "../Auth.css";

export default function Register({ onLogin, onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError("Username must be 3–20 characters using letters, numbers, or underscores.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // ==========================================
    // REAL SUPABASE REGISTRATION CODE
    // Uncomment this block after pulling changes.
    // ==========================================

    /*
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
          },
        },
      });

      if (authError) throw authError;

      if (data.session) {
        setMessage("Account created successfully.");
        onRegisterSuccess?.(data.user);
      } else {
        setMessage(
          "Account created. Check your email to confirm your account."
        );
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
    */

    // TEMPORARY UI TEST — no account is created.
    setMessage("Registration UI is working! Supabase is temporarily disabled.");
    console.log("Registration test:", cleanEmail, cleanUsername);
  }

  return (
    <main className="auth-page">
      <header className="auth-brand">
        <span className="brand-icon">♧</span>
        <span>Mahagedara</span>
      </header>

      <section className="auth-card">
        <h1>Register</h1>

        <form onSubmit={handleRegister}>
          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">✉</span>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-username">Username</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="register-username"
                type="text"
                placeholder="Choose a username"
                autoComplete="username"
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small className="auth-hint">
              Use at least 8 characters.
            </small>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}

          <div className="auth-actions">
            <button
              type="button"
              className="auth-button auth-secondary"
              onClick={onLogin}
            >
              Login
            </button>

            <button
              type="submit"
              className="auth-button auth-primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register →"}
            </button>
          </div>

          <p className="auth-terms">
            By registering, you agree to our{" "}
            <a href="/terms">Terms</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </form>
      </section>

      <footer className="auth-footer">© 2026 Mahagedara</footer>
    </main>
  );
}
