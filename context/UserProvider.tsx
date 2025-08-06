'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { Session, User } from "@supabase/supabase-js"

// Create context
const UserContext = createContext<User | null>(null)

// Exportable hook
export function useUser() {
  return useContext(UserContext)
}

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Fetch initial user session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

