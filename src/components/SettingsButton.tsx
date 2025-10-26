"use client"

import { LogOut, Moon, RotateCcw, Settings, Smartphone, Sun, Users } from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { ConnectionsManager } from "@/components/ConnectionsManager"
import { MobileSetupDialog } from "@/components/MobileSetupDialog"
import { ResetProgressDialog } from "@/components/ResetProgressDialog"

export function SettingsButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [connectionsOpen, setConnectionsOpen] = React.useState(false)
  const [mobileSetupOpen, setMobileSetupOpen] = React.useState(false)
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)

  // Only render after hydration to avoid SSR issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-accent transition-colors mb-2 border-0! outline-none! focus:outline-none! focus:ring-0! active:outline-none! data-[state=open]:outline-none! data-[state=open]:border-0!"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Open settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1">
          <DropdownMenuItem onClick={() => setConnectionsOpen(true)} className="cursor-pointer py-2 px-2 flex justify-between">
            connections
            <Users className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMobileSetupOpen(true)} className="cursor-pointer py-2 px-2 flex justify-between">
            mobile setup
            <Smartphone className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleThemeToggle} className="cursor-pointer py-2 px-2 flex justify-between">
            {theme === "light" ? "dark mode" : "light mode"}
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetDialogOpen(true)} className="cursor-pointer py-2 px-2 text-destructive flex justify-between">
            reset progress
            <RotateCcw className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 px-2 flex justify-between">
            sign out
            <LogOut className="h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ConnectionsManager open={connectionsOpen} onOpenChange={setConnectionsOpen} />
      <MobileSetupDialog open={mobileSetupOpen} onOpenChange={setMobileSetupOpen} />
      <ResetProgressDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen} />
    </>
  )
}
