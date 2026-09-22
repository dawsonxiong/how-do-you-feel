"use client"

import { Check, Copy, ExternalLink, Eye, EyeOff, Play, RefreshCw, Smartphone } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MobileSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSetupDialog({ open, onOpenChange }: MobileSetupDialogProps) {
  const [apiToken, setApiToken] = React.useState<string | null>(null)
  const [showToken, setShowToken] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [urlCopied, setUrlCopied] = React.useState(false)
  const [regenerating, setRegenerating] = React.useState(false)

  React.useEffect(() => {
    if (open && !apiToken) {
      fetchApiToken()
    }
  }, [open, apiToken])

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

  const handleCopyToken = async () => {
    if (apiToken) {
      await navigator.clipboard.writeText(apiToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyUrl = async () => {
    if (apiToken && typeof window !== "undefined") {
      const timeZone = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)
      const url = `${window.location.origin}/api/shortcuts/submit?token=${apiToken}&tz=${timeZone}&rating=`
      await navigator.clipboard.writeText(url)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="gap-2">
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            shortcuts & homescreen setup
          </DialogTitle>
          {/* <DialogDescription>use apple shortcuts to log your mood with ease</DialogDescription> */}
        </DialogHeader>

        <div className="space-y-6 pb-2">
          {/* API Token Section */}
          {/* <div className="space-y-3">
            <h3 className="text-sm font-medium">your api token</h3>
            <div className="flex gap-2">
              <div className="flex-1 font-mono text-sm bg-muted p-3 rounded-md overflow-hidden">
                {apiToken
                  ? showToken
                    ? apiToken
                    : "••••••••-••••-••••-••••-••••••••••••"
                  : "Loading..."}
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
                    copy token
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
          </div> */}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium mt-2">homescreen setup</h3>
            <ol className="text-sm space-y-3 list-decimal list-inside text-muted-foreground">
              <li>press the share button</li>
              <li>select 'Add to Home Screen'</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() =>
                window.open(
                  "https://oxbfjpxeogfadbgzabqy.supabase.co/storage/v1/object/public/how-do-u-feel-videos/homescreen.mp4",
                  "_blank"
                )
              }
            >
              <Play className="w-4 h-4" />
              watch homescreen tutorial
            </Button>

            <h3 className="text-sm font-medium mt-4">shortcuts setup</h3>
            <ol className="text-sm space-y-3 list-decimal list-inside text-muted-foreground">
              {/* <li>copy your api token</li> */}
              <li>
                open shortcuts and create a new shortcut
                <ul className="ml-6 mt-1 space-y-2 list-disc list-inside">
                  <li>search for 'Ask for Input', make the input a Number</li>
                  <li>search for 'Get contents of URL', copy and paste the following</li>
                  <div className="bg-muted p-2 rounded-md relative">
                    <code className="text-xs break-all block pr-8">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/api/shortcuts/submit?token=YOUR_TOKEN&tz=YOUR_TIMEZONE&rating=`
                        : "/api/shortcuts/submit?token=YOUR_TOKEN&tz=YOUR_TIMEZONE&rating="}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={handleCopyUrl}
                      disabled={!apiToken}
                      title="Copy URL with your token"
                    >
                      {urlCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <li>place your cursor at the end of the URL</li>
                  <li>press 'Select Variable', and choose 'Ask for Input'</li>
                  <li>search for 'Show content'</li>
                </ul>
              </li>
              <li>add shortcut to home screen or action button</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() =>
                window.open(
                  "https://oxbfjpxeogfadbgzabqy.supabase.co/storage/v1/object/public/how-do-u-feel-videos/shortcuts.mp4",
                  "_blank"
                )
              }
            >
              <Play className="w-4 h-4" />
              watch shortcuts tutorial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
