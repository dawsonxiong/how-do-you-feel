"use client"

import { useState } from "react"
import { MoodChart } from "@/components/MoodChart"
import { MoodEntryForm } from "@/components/MoodEntryForm"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMoodEntrySuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch lg:mt-32 mt-4">
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
            <div className="w-8" />
          </div>
        </footer>
      </div>
    </div>
  )
}
