"use client"

import { Heart, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface MoodEntryFormProps {
  onSuccess?: () => void
}

const moodLabels = {
  0: "terrible :(",
  1: "very sad",
  2: "sad",
  3: "down",
  4: "low",
  5: "neutral",
  6: "okay",
  7: "good",
  8: "happy",
  9: "great",
  10: "amazing!",
}

export function MoodEntryForm({ onSuccess }: MoodEntryFormProps) {
  const [rating, setRating] = useState([5])
  const [tags, setTags] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: rating[0],
          tags: tags.trim() || null,
          notes: notes.trim() || null,
        }),
      })

      if (response.ok) {
        // Show success animation
        setIsSuccess(true)
        
        // Reset form after animation
        setTimeout(() => {
          setRating([5])
          setTags("")
          setNotes("")
          setIsSuccess(false)
          onSuccess?.()
        }, 1200)
      } else {
        throw new Error("Failed to save mood entry")
      }
    } catch (error) {
      console.error("Error saving mood entry:", error)
      alert("Failed to save mood entry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center text-xl">
          <Heart className="w-5 h-5" />
          how are u feeling?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-base">
                <span className="text-xl font-bold text-primary">{rating[0]}</span>
                <span className="text-muted-foreground">/10</span>
                <span className="mx-2 text-muted-foreground">–</span>
                <span>{moodLabels[rating[0] as keyof typeof moodLabels]}</span>
              </div>
            </div>

            <div className="px-2">
              <Slider
                value={rating}
                onValueChange={setRating}
                max={10}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground/60 mt-2">
                <span>0</span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2 text-muted-foreground">
                tags <span className="text-xs font-normal"/>
              </label>
              <Input
                id="tags"
                type="text"
                placeholder="work, family, exercise..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2 text-muted-foreground">
                notes <span className="text-xs font-normal"/>
              </label>
              <Input
                id="notes"
                type="text"
                placeholder="what's affecting your mood today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className={`w-full transition-all duration-300 ${isSuccess ? "bg-green-500 hover:bg-green-500" : ""}`}
            disabled={isSubmitting || isSuccess}
          >
            <div className="flex items-center justify-center gap-2">
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="animate-pulse">saved!</span>
                </>
              ) : isSubmitting ? (
                <span className="animate-pulse">saving...</span>
              ) : (
                "save"
              )}
            </div>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
