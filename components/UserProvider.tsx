'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useMemo, useCallback } from 'react'
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

  // Use refs to prevent stale closures and unnecessary re-renders
  const isMountedRef = useRef(true)
  const authTimeoutRef = useRef<NodeJS.Timeout>()
  const loadingProfileRef = useRef(false)

  // Memoize loadUserProfile to prevent recreating on every render
  const loadUserProfile = useCallback(async (userId: string) => {
    // Prevent concurrent profile loads
    if (loadingProfileRef.current) {
      return
    }

    loadingProfileRef.current = true
    try {
      // Add timeout to profile fetch
      const profilePromise = db.getUserProfile(userId)
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 5000)
      })

      const userProfile = await Promise.race([profilePromise, timeoutPromise])

      if (isMountedRef.current) {
        setProfile(userProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      if (isMountedRef.current) {
        setProfile(null)
      }
    } finally {
      loadingProfileRef.current = false
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    const checkUser = async () => {
      try {
        // Race the session check against a timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => {
          setTimeout(() => {
            resolve({ data: { session: null }, error: null })
          }, 3000) // 3 second timeout for the session check itself
        })

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])

        if (isMountedRef.current) {
          if (session) {
            setUser(session.user)
            // Set loading to false immediately to unblock the UI
            setInitialized(true)
            setLoading(false)
            // Load profile in background
            loadUserProfile(session.user.id).catch(err => {
              console.error('Background profile load failed:', err)
            })
          } else {
            setInitialized(true)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error)
        if (isMountedRef.current) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    // Set a timeout to prevent infinite loading states
    authTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false)
        setInitialized(true)
        setUser(null)
        setProfile(null)
      }
    }, 5000) // 5 second timeout

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMountedRef.current) {
        // Clear the timeout since we got an auth state change
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current)
        }

        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            // Set loading to false BEFORE loading profile
            // This allows the app to render while profile loads in background
            setLoading(false)
            setInitialized(true)
            // Load profile in background - don't await
            loadUserProfile(session.user.id).catch(err => {
              console.error('Background profile load failed:', err)
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
          setInitialized(true)
        }
      }
    })

    return () => {
      isMountedRef.current = false
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
      }
      subscription.unsubscribe()
    }
  }, [loadUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error
      // Session will be handled by the auth state change listener
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: userData || {}
        }
      })

      if (error) throw error
      // Profile creation will be handled by the auth state change listener
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local state immediately
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !profile) throw new Error('No user logged in')

    try {
      const updatedProfile = await db.updateUserProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }, [user, profile])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await loadUserProfile(user.id)
  }, [user, loadUserProfile])

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
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
  }, [user, refreshProfile])

  const deleteAvatar = useCallback(async (avatarUrl: string): Promise<void> => {
    if (!user) throw new Error("No user logged in")

    const fileName = avatarUrl.split("/").pop()
    if (!fileName) return

    const { error } = await supabase.storage
      .from("avatars")
      .remove([fileName])
    if (error) throw error

    await db.updateUserProfile(user.id, { avatar_url: undefined })
    await refreshProfile()
  }, [user, refreshProfile])

  const addResearchInterest = useCallback(async (interest: string) => {
    if (!user || !profile) throw new Error("No user logged in")
    const newInterests = [...profile.research_interests, interest]
    const updated = await db.updateUserProfile(user.id, {
      research_interests: newInterests,
    })
    setProfile(updated)
  }, [user, profile])

  const removeResearchInterest = useCallback(async (interest: string) => {
    if (!user || !profile) throw new Error("No user logged in")
    const newInterests = profile.research_interests.filter(i => i !== interest)
    const updated = await db.updateUserProfile(user.id, {
      research_interests: newInterests,
    })
    setProfile(updated)
  }, [user, profile])

  // Memoize the context value to prevent unnecessary re-renders
  const value: UserContextType = useMemo(() => ({
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
  }), [user, profile, loading, signIn, signUp, signOut, updateProfile, uploadAvatar, deleteAvatar, addResearchInterest, removeResearchInterest, refreshProfile])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}