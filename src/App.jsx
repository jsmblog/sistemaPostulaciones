import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { useState } from 'react'
import { WaitingRoom } from './components/WaitingRoom'
import { StudentDashboard } from './pages/StudentDashboard'
import { CompanyDashboard } from './pages/CompanyDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  const [rol, setRole] = useState('');
  
  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing handleRoleSelection={handleRoleSelection} />} />
        <Route path='/login' element={<Login />} />
        <Route path='/sign-up' element={<SignUp rol={rol} />} />
        <Route path='/waiting-room' element={<WaitingRoom />} />
        
        <Route 
          path='/student-dashboard' 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path='/company-dashboard' 
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path='/admin-dashboard' 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>  
  )
}

export default App