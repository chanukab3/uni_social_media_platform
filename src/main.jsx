import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Profile from './components/profile/Profile.jsx'
import Login from './components/login/Login.jsx'
import Wall from './components/wall/Wall.jsx'
import Community from './components/community/Community.jsx'
import Status from './components/status/Status.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
    
    {/*<App />
    <Login />
    <Wall/>
    <Profile />
    <Community/>
    <Status/>*/}
  </StrictMode>,
)
