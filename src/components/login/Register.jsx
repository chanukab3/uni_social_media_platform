import { useState } from "react";
import { supabase } from "../../../supabase";
import "./Auth.css";

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

    if (loading) return;

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().replace(/\s+/g, " ");

    if (cleanUsername.length < 2 || cleanUsername.length > 40) {
      setError("Your name must be between 2 and 40 characters.");
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured. Add your project URL and publishable key.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanEmail.slice(0, cleanEmail.indexOf("@")),
              display_name: cleanUsername,
            },
          },
        });

      if (authError) {
        const errorText = authError.message.toLowerCase();

        if (
          errorText.includes("rate limit") ||
          errorText.includes("too many requests")
        ) {
          throw new Error(
            "Too many registration emails have been requested. Please wait before trying again."
          );
        }

        if (
          errorText.includes("already registered") ||
          errorText.includes("already exists")
        ) {
          throw new Error(
            "This email may already be registered. Please try logging in."
          );
        }

        throw authError;
      }

      if (data.session) {
        setMessage("Account created successfully.");
        onRegisterSuccess?.(data.user);
      } else {
        setMessage(
          "Registration submitted. Please check your email to confirm your account."
        );
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-username">Display name</label>

            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>

              <input
                id="register-username"
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
                minLength={2}
                maxLength={40}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                disabled={loading}
              />
            </div>
            <small className="auth-hint">Your username will be the part of your email before @.</small>
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
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <small className="auth-hint">
              Use at least 8 characters.
            </small>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-success" role="status">
              {message}
            </p>
          )}

          <div className="auth-actions">
            <button
              type="button"
              className="auth-button auth-secondary"
              onClick={onLogin}
              disabled={loading}
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

      <footer className="auth-footer">
        © 2026 Mahagedara
      </footer>
    </main>
  );
}
