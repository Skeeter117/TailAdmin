import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { userProfile, isAdmin } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-[#0f1419] border-b border-[#1e293b] sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                isAdmin()
                  ? 'bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/20'
                  : 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20'
              }`}>
                {isAdmin() ? 'PRS Staff' : userProfile?.organization || 'WCOC'}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-[#f8fafc]">{userProfile.full_name}</div>
                    <div className="text-xs text-[#94a3b8]">{userProfile.email}</div>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isAdmin() ? 'bg-[#3b82f6] text-white' : 'bg-[#f59e0b] text-white'
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
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
