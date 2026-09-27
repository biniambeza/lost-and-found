import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAdmin from './shared/components/RequireAdmin.jsx'
import RequireAuth from './shared/components/RequireAuth.jsx'
import Home from './shared/pages/Home.jsx'
import Login from './shared/pages/Login.jsx'
import Signup from './shared/pages/Signup.jsx'
import AdminDashboard from './admin/pages/AdminDashboard.jsx'
import ManageUsers from './admin/pages/ManageUsers.jsx'
import ItemDetails from './user/pages/ItemDetails.jsx'
import ReportItem from './user/pages/ReportItem.jsx'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/report" element={<RequireAuth><ReportItem /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><ManageUsers /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
