"use client"

import { useState } from "react"
import { MoodChart } from "@/components/mood-chart"
import { MoodEntryForm } from "@/components/mood-entry-form"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMoodEntrySuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-32">
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
        <footer className="mt-16 text-center text-muted-foreground">
          <p className="text-sm">for you</p>
          <p className="text-sm">- d</p>
        </footer>
      </div>
    </div>
  )
}
