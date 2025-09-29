"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { MoodChart } from "@/components/MoodChart"
import { MoodEntryForm } from "@/components/MoodEntryForm"
import { SettingsButton } from "@/components/SettingsButton"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserProfile } from "@/components/UserProfile"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMoodEntrySuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:!bg-black dark:!bg-none">
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          {/* Header with User Profile */}
          <header className="flex justify-end mb-8">
            <UserProfile />
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:mt-20 mt-4">
            {/* Mood Entry Form */}
            <div className="order-1 lg:order-1">
              <MoodEntryForm onSuccess={handleMoodEntrySuccess} />
            </div>

            {/* Mood Chart */}
            <div className="order-2 lg:order-2">
              <MoodChart refreshTrigger={refreshTrigger} />
            </div>
          </div>
          {/* Footer */}
          <footer className="mt-8 text-muted-foreground">
            <div className="flex items-center justify-between w-full mx-auto">
              <div>
                <ThemeToggle />
              </div>
              <div className="flex-1 flex justify-center">
                <p className="text-sm text-center">for j</p>
              </div>
              <div>
                <SettingsButton />
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AuthGuard>
  )
}
