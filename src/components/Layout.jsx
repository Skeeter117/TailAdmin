import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { userProfile, isAdmin } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/assets', label: 'Assets', icon: '🏗️' },
    ...(isAdmin() ? [
      { path: '/work-orders', label: 'Work Orders', icon: '🔧' }
    ] : [
      { path: '/pending-approvals', label: 'Pending Approvals', icon: '✓' }
    ])
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors"
              >
                <span className="text-2xl">🏭</span>
                <span>PRS Industrial Inc.</span>
              </button>

              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-slate-200">{userProfile.full_name}</div>
                  <div className="flex items-center justify-end space-x-2 text-xs">
                    <span className={`badge ${isAdmin() ? 'badge-info' : 'badge-warning'}`}>
                      {isAdmin() ? 'PRS Staff' : userProfile.organization}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="btn btn-ghost text-sm"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex overflow-x-auto scrollbar-thin px-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                isActive(item.path)
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
