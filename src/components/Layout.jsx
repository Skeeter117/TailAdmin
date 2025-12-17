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
    { path: '/', label: 'Dashboard' },
    { path: '/assets', label: 'Assets' },
    ...(isAdmin() ? [
      { path: '/work-orders', label: 'Work Orders' }
    ] : [
      { path: '/pending-approvals', label: 'Pending Approvals' }
    ])
  ]

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <nav className="border-b border-[#1e293b] bg-[#0f1419] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2.5 text-[#f8fafc] hover:text-[#60a5fa] transition-colors"
              >
                <div className="w-8 h-8 bg-[#3b82f6] rounded-md flex items-center justify-center font-bold text-white text-sm">
                  PRS
                </div>
                <span className="text-base font-semibold">PRS Industrial</span>
              </button>

              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`nav-link ${
                      isActive(item.path)
                        ? 'nav-link-active'
                        : 'nav-link-inactive'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#f8fafc]">{userProfile.full_name}</div>
                    <div className="text-xs text-[#94a3b8]">
                      {isAdmin() ? 'PRS Staff' : userProfile.organization}
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isAdmin() ? 'bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/20' : 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
                  }`}>
                    {userProfile.full_name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="btn btn-ghost text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden border-b border-[#1e293b] bg-[#0f1419]">
        <div className="flex overflow-x-auto scrollbar-thin">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all ${
                isActive(item.path)
                  ? 'text-[#60a5fa] border-b-2 border-[#3b82f6]'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
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
