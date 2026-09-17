import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StudentsList from './pages/StudentsList'
import CreateStudent from './pages/CreateStudent'
import EditStudent from './pages/EditStudent'
import ClassesList from './pages/ClassesList'
import PresencesList from './pages/PresencesList'
import PointagePage from './pages/PointagePage'
import DashboardLayout from './components/layout/DashboardLayout'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Chargement...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />


      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/eleves" element={<StudentsList />} />
        <Route path="/eleves/nouveau" element={<CreateStudent />} />
        <Route path="/eleves/:id/modifier" element={<EditStudent />} />
        <Route path="/classes" element={<ClassesList />} />
        <Route path="/presences" element={<PresencesList />} />
        <Route path="/presences/pointage" element={<PointagePage />} />
        {/* <Route path="/personnel" element={<Staff />} /> */}
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
