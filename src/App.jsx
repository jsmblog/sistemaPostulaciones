import './App.css'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { useState } from 'react'
import { WaitingRoom } from './components/WaitingRoom'
function App() {
 const [rol,setRole] = useState('');
 const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing handleRoleSelection={handleRoleSelection} />} />
        <Route path='/login' element={<Login/>}  />
        <Route path='/sign-up' element={<SignUp rol={rol} />}  />
        <Route path='/waiting-room' element={<WaitingRoom/>}/>
      </Routes>
    </Router>  
  )
}

export default App
