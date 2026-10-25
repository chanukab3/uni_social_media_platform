import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/login/Login.jsx'
import Wall from './components/wall/Wall.jsx'
import Profile from './components/profile/Profile.jsx'
import Status from './components/status/Status.jsx'
import Register from './components/Register/Register.jsx'




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  {/*   <Login/>
    <Profile/>
    <Status/>
    <Wall/> 
    
    <Community />
    <Register/>*/}
  </StrictMode>,
)
