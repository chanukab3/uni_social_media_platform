/* function App() {
  return ( 
    <>
      <h2>Mahagedara</h2>
    </>
   );
}

export default App */



import { useState } from "react";
import Login from "./components/login/Login";
import Register from "./components/Register/Register";

import Community from "./components/Community/Community";
import ForgotPassword from "./components/login/Froget";

export default function App() {
  const [page, setPage] = useState("login");

  if (page === "register") {
    return <Register onLogin={() => setPage("login")} />;
  }

  if (page === "forgot") {
    return <ForgotPassword onLogin={() => setPage("login")} />;
  }

  if (page === "community") {
    return (
      <Community
        onHome={() => setPage("community")}
        onWall={() => setPage("wall")}
      />
    );
  }

  if (page === "wall") {
    return (
      <main style={{ }}>
        <h1>Wall</h1>
        <p>Connect your teammate's existing Wall component here.</p>
        <button onClick={() => setPage("community")}>
          Back to Community
        </button>
      </main>
    );
  }

  return (
    <Login
      onRegister={() => setPage("register")}
      onForgotPassword={() => setPage("forgot")}
      onLoginSuccess={() => setPage("community")}
    />
  );
}

