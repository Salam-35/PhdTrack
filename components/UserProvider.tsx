'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, db, type UserProfile } from '@/lib/supabase'

interface UserContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: any) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  deleteAvatar: (avatarUrl: string) => Promise<void>
  addResearchInterest: (interest: string) => Promise<void>
  removeResearchInterest: (interest: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | null>(null)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true
    let authTimeout: NodeJS.Timeout

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          if (session) {
            setUser(session.user)
            await loadUserProfile(session.user.id)
          }
          setInitialized(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error checking user session:', error)
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Set a timeout to prevent infinite loading states
    authTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('Authentication check timeout - falling back to unauthenticated state')
        setLoading(false)
        setInitialized(true)
        setUser(null)
        setProfile(null)
      }
    }, 10000) // 10 second timeout

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        console.log('Auth state changed:', event, session?.user?.id)

        // Clear the timeout since we got an auth state change
        if (authTimeout) {
          clearTimeout(authTimeout)
        }

        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            await loadUserProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }

        setInitialized(true)
        setLoading(false)
      }
    })

    // Handle visibility change to refresh auth state when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        // Only refresh if we think we have a user but haven't loaded profile recently
        if (user && !profile && !loading) {
          console.log('Tab became visible - refreshing user state')
          loadUserProfile(user.id)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])


  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)

      // Add a timeout to the profile loading
      const profilePromise = db.getUserProfile(userId)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 5000)
      )

      const userProfile = await Promise.race([profilePromise, timeoutPromise]) as any
      setProfile(userProfile)
      console.log('Profile loaded:', userProfile ? 'Success' : 'Not found')
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Still set profile to null, but don't fail the auth completely
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      
      if (error) throw error
      
      // Session will be handled by the auth state change listener
      console.log('Sign in successful')
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      // Don't set loading to false here, let the auth state listener handle it
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: userData || {}
        }
      })
      
      if (error) throw error
      
      console.log('Sign up successful')
      // Profile creation will be handled by the auth state change listener
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      // Don't set loading to false here, let the auth state listener handle it
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state immediately
      setUser(null)
      setProfile(null)
      
      console.log('Sign out successful')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error('No user logged in')
    
    try {
      const updatedProfile = await db.updateUserProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user logged in')

    const fileExt = file.name.split(".").pop()
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`

    // Delete old avatar if exists
    const currentProfile = await db.getUserProfile(user.id)
    const oldUrl = currentProfile?.avatar_url
    if (oldUrl) {
      const oldFile = oldUrl.split("/").pop()
      if (oldFile) {
        await supabase.storage.from("avatars").remove([oldFile])
      }
    }
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file)

    if (error) throw error

    const {
      data: { publicUrl }
    } = supabase.storage.from("avatars").getPublicUrl(fileName)

    // Update DB
    await db.updateUserProfile(user.id, { avatar_url: publicUrl })
    await refreshProfile()
    return publicUrl
  }

  const deleteAvatar = async (avatarUrl: string): Promise<void> => {
    if (!user) throw new Error("No user logged in")

    const fileName = avatarUrl.split("/").pop()
    if (!fileName) return

    const { error } = await supabase.storage
      .from("avatars")
      .remove([fileName])
    if (error) throw error

    await db.updateUserProfile(user.id, { avatar_url: undefined })
    await refreshProfile()
  }

  const addResearchInterest = async (interest: string) => {
    if (!user || !profile) throw new Error("No user logged in")
    const newInterests = [...profile.research_interests, interest]
    const updated = await db.updateUserProfile(user.id, {
      research_interests: newInterests,
    })
    setProfile(updated)
  }

  const removeResearchInterest = async (interest: string) => {
    if (!user || !profile) throw new Error("No user logged in")
    const newInterests = profile.research_interests.filter(i => i !== interest)
    const updated = await db.updateUserProfile(user.id, {
      research_interests: newInterests,
    })
    setProfile(updated)
  }

  const refreshProfile = async () => {
    if (!user) return
    await loadUserProfile(user.id)
  }

  const value: UserContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    addResearchInterest,
    removeResearchInterest,
    refreshProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}