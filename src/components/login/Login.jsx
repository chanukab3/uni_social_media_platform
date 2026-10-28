import{ useState } from "react";
import{ supabase } from "../../../supabase";
import "./Auth.css";

export default function Login({
  onRegister,
  onForgotPassword,
  onLoginSuccess,
}){
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event){
    event.preventDefault();
    setError("");

    if(!identifier.trim() || !password){
      setError("Please enter your email address and password.");
      return;
    }

    if(!supabase){
      setError("Supabase is not configured. Add your project URL and publishable key.");
      return;
    }

    setLoading(true);

    try{
      const{ data, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier.trim().toLowerCase(),
        password,
      });

      if(authError) throw authError;

      onLoginSuccess?.(data.user);
    } catch(err){
      setError(err.message || "Unable to log in. Please try again.");
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
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <div className="auth-input-wrap">
              <span aria-hidden="true">♙</span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
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

         {error &&(
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="auth-button auth-primary auth-full-button"
            disabled={loading}
          >
           {loading ? "Logging in..." : "Login"}
          </button>
          <p className="auth-switch">
            Don&apos;t have an account?{" "}
            <button type="button" className="auth-link" onClick={onRegister}>
              Register
            </button>
          </p>
        </form>
      </section>

      <footer className="auth-footer">
        © 2026 Mahagedara
      </footer>
    </main>
  );
}
