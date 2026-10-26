import{ useState } from "react";
import{ supabase } from "../../../supabase";
import "./Auth.css";

export default function ResetPassword({ onLogin }){
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(event){
    event.preventDefault();
    setError("");
    setMessage("");

    if(password.length < 8){
      setError("Password must contain at least 8 characters.");
      return;
    }

    if(password !== confirmPassword){
      setError("Passwords do not match.");
      return;
    }

    if(!supabase){
      setError("Supabase is not configured. Add your project URL and publishable key.");
      return;
    }

    setLoading(true);

    try{
      const{ error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if(updateError) throw updateError;

      setMessage("Your password has been updated. You can now log in.");
      setPassword("");
      setConfirmPassword("");
    } catch(err){
      setError(err.message || "Unable to update your password.");
    } finally{
      setLoading(false);
    }
  }

  return(
    <main className="auth-page">
      <header className="auth-brand">
        <span className="brand-icon">♧</span>
        <span>Mahagedara</span>
      </header>

      <section className="auth-card">
        <h1>Set a new password</h1>

        <form onSubmit={handleUpdatePassword}>
          <div className="auth-field">
            <label htmlFor="new-password">New password</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                placeholder="Enter a new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
               {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Re-enter the new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
           {loading ? "Updating..." : "Update password →"}
          </button>

         {message &&(
            <button type="button" className="auth-back-link" onClick={onLogin}>
              ← login
            </button>
          )}
        </form>
      </section>

      <footer className="auth-footer">© 2026 Mahagedara</footer>
    </main>
  );
}
