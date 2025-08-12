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

  useEffect(() => {
      let mounted = true;

      const initializeAuth = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session error:', error);
            await supabase.auth.signOut();
          }

          if (mounted) {
            console.log('Initial session:', session ? 'Found' : 'None');
            setUser(session?.user ?? null);
            if (session?.user) {
              await loadUserProfile(session.user.id);
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        } finally {
          // ✅ Always set loading false here
          if (mounted) setLoading(false);
        }
      };

      initializeAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
          if (!mounted) return;

          try {
            setUser(session?.user ?? null);

            if (session?.user) {
              await loadUserProfile(session.user.id);
              if (event === 'SIGNED_IN') {
                const existingProfile = await db.getUserProfile(session.user.id);
                if (!existingProfile) {
                  await db.createDefaultProfile(session.user);
                  await loadUserProfile(session.user.id);
                }
              }
            } else {
              setProfile(null);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            setUser(null);
            setProfile(null);
          } finally {
            // ✅ Also ensure loading is false here
            setLoading(false);
          }
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }, []);


  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)
      const userProfile = await db.getUserProfile(userId)
      setProfile(userProfile)
      console.log('Profile loaded:', userProfile ? 'Success' : 'Not found')
    } catch (error) {
      console.error('Error loading user profile:', error)
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