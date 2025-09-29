"use client"

import { LogOut, Moon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

export function SettingsButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Only render after hydration to avoid SSR issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    // Create a form and submit it to sign out
    const form = document.createElement("form")
    form.method = "post"
    form.action = "/api/auth/signout"
    document.body.appendChild(form)
    form.submit()
  }

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full mb-2">
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-accent transition-colors mb-2 !border-0 !outline-none focus:!outline-none focus:!ring-0 active:!outline-none data-[state=open]:!outline-none data-[state=open]:!border-0 [&[data-state=open]]:!outline-none [&[data-state=open]]:!border-0"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit min-w-0 p-1">
        <DropdownMenuItem onClick={handleThemeToggle} className="cursor-pointer py-2 px-2">
          {theme === "light" ? "dark mode" : "light mode"}
          {theme === "light" ? <Moon className="ml-2 h-4 w-4" /> : <Sun className="ml-2 h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 px-2">
          sign out
          <LogOut className="ml-2 h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
