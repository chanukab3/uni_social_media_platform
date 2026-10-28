import{ useState } from "react";
import{ supabase } from "../../../supabase";
import "./Auth.css";

export default function ForgotPassword({ onLogin }){
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event){
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if(!cleanEmail){
      setError("Please enter your email address.");
      return;
    }

    if(!supabase){
      setError("Supabase is not configured. Add your project URL and publishable key.");
      return;
    }

    setLoading(true);

    try{
      const{ error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail,{
          redirectTo: window.location.origin,
        });

      if(resetError) throw resetError;

      setMessage(
        "Check your inbox for reset instructions."
      );
    } catch(err){
      setError(err.message || "Unable to send the reset email.");
    } finally{
      setLoading(false);
    }
  }

  return(
    <main className="auth-page">
      <header className="auth-brand">
        <span className="brand-icon"><img src="/mg.png" width="35px" height="auto"/></span>
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
           {loading ? "Sending..." : "Send reset link"}
          </button>

          <button
            type="button"
            className="auth-back-link"
            onClick={onLogin}
          >
            login
          </button>
        </form>
      </section>

      <footer className="auth-footer">© 2026 Mahagedara</footer>
    </main>
  );
}
