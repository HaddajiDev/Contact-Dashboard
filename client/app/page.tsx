"use client"

import { AuthProvider, useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { DashboardLayout } from "@/components/dashboard-layout"

function AppContent() {
  const { user, login, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={login} />
  }

  return <DashboardLayout />
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
