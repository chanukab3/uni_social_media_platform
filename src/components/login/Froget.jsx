
import { useState } from "react";
// SUPABASE: uncomment after pulling your teammate's changes
// import { supabase } from "../../lib/supabaseClient";
import "../Auth.css";

export default function ForgotPassword({ onLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    // ==========================================
    // REAL SUPABASE PASSWORD RESET CODE
    // Uncomment this block after pulling changes.
    // ==========================================

    /*
    setLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) throw resetError;

      setMessage(
        "If an account exists for this email, check your inbox for reset instructions."
      );
    } catch (err) {
      setError(err.message || "Unable to send the reset email.");
    } finally {
      setLoading(false);
    }
    */

    // TEMPORARY UI TEST — no email is sent.
    setMessage("Password reset UI is working! Supabase is temporarily disabled.");
    console.log("Password reset test:", cleanEmail);
  }

  return (
    <main className="auth-page">
      <header className="auth-brand">
        <span className="brand-icon">♧</span>
        <span>Mahagedara</span>
      </header>

      <section className="auth-card">
        <h1>Forgot password</h1>

        <form onSubmit={handleReset}>
          <div className="auth-field">
            <label htmlFor="reset-email">Email</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">✉</span>
              <input
                id="reset-email"
                type="email"
                placeholder="Enter your email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}

          <button
            type="submit"
            className="auth-button auth-primary auth-full-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification Code →"}
          </button>

          <button
            type="button"
            className="auth-back-link"
            onClick={onLogin}
          >
            ← login
          </button>
        </form>
      </section>

      <footer className="auth-footer">© 2026 Mahagedara</footer>
    </main>
  );
}
