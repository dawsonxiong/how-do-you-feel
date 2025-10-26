"use client"

import { RefreshCw, Trash2 } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ResetProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResetProgressDialog({ open, onOpenChange }: ResetProgressDialogProps) {
  const [isResetting, setIsResetting] = React.useState(false)

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
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="gap-4">
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            reset progress
          </DialogTitle>
          <DialogDescription>
            this will permanently delete all your mood entries. this action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
                <Trash2 className="w-4 h-4" />
                reset all data
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

