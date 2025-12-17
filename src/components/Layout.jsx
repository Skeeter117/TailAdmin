import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { userProfile } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
              >
                PRS Industrial Inc.
              </button>
            </div>
            <div className="flex items-center gap-4">
              {userProfile && (
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{userProfile.full_name}</div>
                  <div className="text-xs text-gray-500">{userProfile.organization}</div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
