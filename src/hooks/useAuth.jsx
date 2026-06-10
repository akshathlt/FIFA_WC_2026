import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [player, setPlayer]   = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) { setPlayer(null); return }
    supabase
      .from('players')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => setPlayer(data))
  }, [session])

  const signInWithEmail = (email) =>
    supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/wc2026-predictor/` } })

  const signInWithPassword = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const createProfile = async (displayName, groupCode = 'WC2026') => {
    const { data, error } = await supabase
      .from('players')
      .upsert({ user_id: session.user.id, display_name: displayName, email: session.user.email, group_code: groupCode }, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error) setPlayer(data)
    return { data, error }
  }

  return (
    <AuthContext.Provider value={{ session, player, setPlayer, signInWithEmail, signInWithPassword, signOut, createProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
