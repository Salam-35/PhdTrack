'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/components/UserProvider'
import { GraduationCap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

const publicRoutes = ['/login', '/signup']

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signIn, signUp } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authTimeout, setAuthTimeout] = useState(false)

  // Use refs to track navigation to prevent duplicate redirects
  const hasRedirectedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Memoize whether current route is public
  const isPublicRoute = useMemo(() => publicRoutes.includes(pathname), [pathname])

  // Reset redirect flag when pathname changes
  useEffect(() => {
    hasRedirectedRef.current = false
  }, [pathname])

  // Add timeout for stuck loading states
  useEffect(() => {
    if (loading) {
      timeoutRef.current = setTimeout(() => {
        setAuthTimeout(true)
      }, 5000) // 5 second timeout

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    } else {
      setAuthTimeout(false)
    }
  }, [loading])

  // Handle navigation redirects
  useEffect(() => {
    // Don't redirect while loading (unless timeout occurred)
    if (loading && !authTimeout) return

    // Prevent duplicate redirects
    if (hasRedirectedRef.current) return

    if (!user && !isPublicRoute) {
      hasRedirectedRef.current = true
      router.push('/login')
    } else if (user && isPublicRoute) {
      hasRedirectedRef.current = true
      router.push('/')
    }
  }, [user, loading, isPublicRoute, router, authTimeout, pathname])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (authMode === 'login') {
        await signIn(email, password)
        toast({
          title: 'Welcome back!',
          description: 'Successfully logged in.'
        })
      } else {
        await signUp(email, password)
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading screen only if truly loading and timeout hasn't occurred
  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading PhD Tracker Pro</h2>
          <p className="text-gray-600">Checking authentication...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-primary-500" />
        </div>
      </div>
    )
  }

  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {authMode === 'login' ? 'Welcome Back' : 'Join PhD Tracker Pro'}
            </CardTitle>
            <p className="text-gray-600">
              {authMode === 'login' 
                ? 'Sign in to manage your PhD applications' 
                : 'Create an account to get started'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary-500 hover:bg-primary-600"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  setEmail('')
                  setPassword('')
                }}
                className="text-primary-500 hover:text-primary-600 text-sm"
                disabled={isSubmitting}
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
 }