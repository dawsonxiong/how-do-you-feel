"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ReactNode, useEffect } from "react"

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!session) {
    return null
  }

  return <>{children}</>
}
