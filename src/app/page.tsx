'use client'

import { useState } from 'react'
import { MoodEntryForm } from '@/components/mood-entry-form'
import { MoodChart } from '@/components/mood-chart'

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMoodEntrySuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            How Do You Feel?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your daily mood and emotions. Discover patterns in your mental wellbeing with beautiful visualizations.
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Mood Entry Form */}
          <div className="order-1 lg:order-1">
            <MoodEntryForm onSuccess={handleMoodEntrySuccess} />
          </div>

          {/* Mood Chart */}
          <div className="order-2 lg:order-2">
            <MoodChart refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Track Daily</h3>
            <p className="text-sm text-muted-foreground">
              Log multiple entries per day and see your daily average mood
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold mb-2">Visualize Trends</h3>
            <p className="text-sm text-muted-foreground">
              Beautiful line charts show your mood patterns over time
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border">
            <div className="text-3xl mb-3">🏷️</div>
            <h3 className="font-semibold mb-2">Add Context</h3>
            <p className="text-sm text-muted-foreground">
              Optional tags and notes help you understand what affects your mood
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-muted-foreground">
          <p className="text-sm">
            Your mental health matters. Track your journey with care and compassion. 💙
          </p>
        </footer>
      </div>
    </div>
  )
}
