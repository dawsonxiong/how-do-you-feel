"use client"

import { Check, Copy, Eye, EyeOff, LogOut, Moon, RefreshCw, RotateCcw, Settings, Smartphone, Sun, Trash2, Users } from "lucide-react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { ConnectionsManager } from "@/components/ConnectionsManager"

export function SettingsButton() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [connectionsOpen, setConnectionsOpen] = React.useState(false)
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false)
  const [apiToken, setApiToken] = React.useState<string | null>(null)
  const [showToken, setShowToken] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [regenerating, setRegenerating] = React.useState(false)
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)
  const [isResetting, setIsResetting] = React.useState(false)

  // Only render after hydration to avoid SSR issues
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const fetchApiToken = async () => {
    try {
      const response = await fetch("/api/shortcuts/auth")
      if (response.ok) {
        const data = await response.json()
        setApiToken(data.token)
      }
    } catch (error) {
      console.error("Error fetching API token:", error)
    }
  }

  const handleShortcutsOpen = () => {
    setShortcutsOpen(true)
    if (!apiToken) {
      fetchApiToken()
    }
  }

  const handleCopyToken = async () => {
    if (apiToken) {
      await navigator.clipboard.writeText(apiToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerateToken = async () => {
    setRegenerating(true)
    try {
      const response = await fetch("/api/shortcuts/auth", { method: "POST" })
      if (response.ok) {
        const data = await response.json()
        setApiToken(data.token)
        setShowToken(true)
      }
    } catch (error) {
      console.error("Error regenerating token:", error)
    } finally {
      setRegenerating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const handleResetProgress = async () => {
    setIsResetting(true)
    try {
      const response = await fetch("/api/mood/reset", {
        method: "DELETE",
      })
      
      if (response.ok) {
        // Refresh the page to update the chart
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to reset progress")
      }
    } catch (error) {
      console.error("Error resetting progress:", error)
      alert("Failed to reset progress")
    } finally {
      setIsResetting(false)
      setResetDialogOpen(false)
    }
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
        <DropdownMenuContent align="end" className="w-fit min-w-0 p-1">
          <DropdownMenuItem onClick={() => setConnectionsOpen(true)} className="cursor-pointer py-2 px-2">
            connections
            <Users className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShortcutsOpen} className="cursor-pointer py-2 px-2">
            shortcuts
            <Smartphone className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleThemeToggle} className="cursor-pointer py-2 px-2">
            {theme === "light" ? "dark mode" : "light mode"}
            {theme === "light" ? <Moon className="ml-2 h-4 w-4" /> : <Sun className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetDialogOpen(true)} className="cursor-pointer py-2 px-2 text-destructive">
            reset progress
            <RotateCcw className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2 px-2">
            sign out
            <LogOut className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ConnectionsManager open={connectionsOpen} onOpenChange={setConnectionsOpen} />
      
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="gap-2">
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              widget setup
            </DialogTitle>
            <DialogDescription>
              Use Apple Shortcuts to log your mood from your home screen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* API Token Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Your API Token</h3>
              <div className="flex gap-2">
                <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-md overflow-hidden">
                  {apiToken ? (
                    showToken ? apiToken : "••••••••-••••-••••-••••-••••••••••••"
                  ) : (
                    "Loading..."
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                  title={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyToken}
                  disabled={!apiToken}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Token
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateToken}
                  disabled={regenerating}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Quick Setup Instructions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Quick Setup</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Copy your API token above</li>
                <li>Open the Shortcuts app on your iPhone</li>
                <li>Create a new shortcut with these actions:
                  <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-xs">
                    <li>Get Contents of URL</li>
                    <li>Show Result</li>
                  </ul>
                </li>
                <li>Add shortcut to home screen</li>
              </ol>
              
              <div className="bg-muted p-3 rounded-md space-y-2">
                <p className="text-xs font-medium">View Latest Mood:</p>
                <code className="text-xs break-all block">
                  {typeof window !== "undefined" 
                    ? `${window.location.origin}/api/shortcuts/latest?token=YOUR_TOKEN`
                    : "/api/shortcuts/latest?token=YOUR_TOKEN"
                  }
                </code>
              </div>
              
              <div className="bg-muted p-3 rounded-md space-y-2">
                <p className="text-xs font-medium">Log New Mood:</p>
                <code className="text-xs break-all block">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/shortcuts/submit?token=YOUR_TOKEN&rating=7.5`
                    : "/api/shortcuts/submit?token=YOUR_TOKEN&rating=7.5"
                  }
                </code>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Progress Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              reset progress
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all your mood entries. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              disabled={isResetting}
            >
              cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetProgress}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  resetting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  reset all data
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
