"use client"

import { Settings } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"

export function SettingsButton() {
  const [mounted, setMounted] = React.useState(false)

  // Only render after hydration to avoid SSR issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSettingsClick = () => {
    // Functionality to be implemented later
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full mb-2">
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSettingsClick}
      className="h-8 w-8 rounded-full hover:bg-accent transition-colors mb-2"
    >
      <Settings className="h-4 w-4" />
      <span className="sr-only">Open settings</span>
    </Button>
  )
}
