"use client"

import { useState } from "react"
import { MoodChart } from "@/components/MoodChart"
import { MoodEntryForm } from "@/components/MoodEntryForm"
import { SettingsButton } from "@/components/SettingsButton"
import { UserProfile } from "@/components/UserProfile"

export function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMoodEntrySuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:bg-black! dark:bg-none!">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header
        <header className="flex justify-end mb-8">
          <UserProfile />
        </header> */}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mt-2 lg:mt-12">
          <MoodEntryForm onSuccess={handleMoodEntrySuccess} />
          <MoodChart refreshTrigger={refreshTrigger} />
        </div>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between text-muted-foreground">
          <div className="flex-1" />
          {/* <p className="text-sm">for j</p> */}
          <div className="flex-1 flex justify-end">
            <SettingsButton />
          </div>
        </footer>
      </div>
    </div>
  )
}
