import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setLoading(false)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => {
    return userProfile?.role === 'admin'
  }

  const isCustomer = () => {
    return userProfile?.role === 'customer'
  }

  const canEdit = () => {
    return isAdmin()
  }

  const canApproveRepairs = () => {
    return isAdmin() || isCustomer()
  }

  const value = {
    session,
    userProfile,
    loading,
    isAdmin,
    isCustomer,
    canEdit,
    canApproveRepairs
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
