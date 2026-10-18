/* function Login() {
    return ( 
        <>
        <h2></h2>
        </>
     );
}

export default Login; */


import { useState } from "react";
//import { supabase } from "../../lib/supabaseClient";
import "../Auth.css";

export default function Login({
  onRegister,
  onForgotPassword,
  onLoginSuccess,
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

/*   async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setLoading(true);

    try {
      let email = identifier.trim();

      // Email login works directly. Username login requires
      // a profiles table containing username and email columns.
      if (!email.includes("@")) {
        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("email")
            .ilike("username", email)
            .maybeSingle();

        if (profileError) throw profileError;

        if (!profile?.email) {
          setError("Account not found. Check your username or email.");
          return;
        }

        email = profile.email;
      }

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      onLoginSuccess?.(data.user);
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  } */

    async function handleLogin(event) {
  event.preventDefault();
  setError("");

  if (!identifier.trim() || !password) {
    setError("Please enter your username/email and password.");
    return;
  }

  // Temporary UI testing only — no real authentication.
  console.log("Login UI test:", identifier);
  alert("Login UI is working!");

  onLoginSuccess?.({ id: "test-user" });
}
  return (
    <main className="auth-page">
      <header className="auth-brand">
        <span className="brand-icon">♧</span>
        <span>Mahagedara</span>
      </header>

      <section className="auth-card">
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="login-identifier">
              Username or email
            </label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-forgot">
            <button
              type="button"
              className="auth-link"
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <div className="auth-actions">
            <button
              type="submit"
              className="auth-button auth-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>

            <button
              type="button"
              className="auth-button auth-secondary"
              onClick={onRegister}
            >
              Register
            </button>
          </div>
        </form>
      </section>

      <footer className="auth-footer">
        © 2026 Mahagedara
      </footer>
    </main>
  );
}
