'use client'

import React from "react"
import { useUser } from "@/components/UserProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, LogIn } from "lucide-react"

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading PhD Tracker Pro</h2>
          <p className="text-gray-600">Setting up your academic journey...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to PhD Tracker Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Organize your PhD applications, manage documents, and track your academic journey.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  className="w-full bg-primary-500 hover:bg-primary-600"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/signup'} 
                  variant="outline" 
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Track university applications</li>
                <li>• Manage professor contacts</li>
                <li>• Organize documents</li>
                <li>• Timeline planning</li>
                <li>• Progress analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}