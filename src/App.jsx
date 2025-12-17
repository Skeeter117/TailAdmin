import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import AssetDetail from './components/AssetDetail'
import Layout from './components/Layout'

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            session ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/asset/:id"
          element={
            session ? (
              <Layout>
                <AssetDetail />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
