'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Heart } from 'lucide-react'

interface MoodEntryFormProps {
  onSuccess?: () => void
}

const moodLabels = {
  0: 'Terrible 😰',
  1: 'Very Sad 😢',
  2: 'Sad 😔',
  3: 'Down 🙁',
  4: 'Low 😕',
  5: 'Neutral 😐',
  6: 'Okay 🙂',
  7: 'Good 😊',
  8: 'Happy 😁',
  9: 'Great 🤩',
  10: 'Amazing! 🚀'
}

export function MoodEntryForm({ onSuccess }: MoodEntryFormProps) {
  const [rating, setRating] = useState([5])
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: rating[0],
          tags: tags.trim() || null,
          notes: notes.trim() || null,
        }),
      })

      if (response.ok) {
        // Reset form
        setRating([5])
        setTags('')
        setNotes('')
        onSuccess?.()
      } else {
        throw new Error('Failed to save mood entry')
      }
    } catch (error) {
      console.error('Error saving mood entry:', error)
      alert('Failed to save mood entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center justify-center">
          <Heart className="w-5 h-5 text-red-500" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {rating[0]}
              </div>
              <div className="text-lg mb-4">
                {moodLabels[rating[0] as keyof typeof moodLabels]}
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
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Terrible</span>
                <span>Amazing</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">
                Tags (optional)
              </label>
              <Input
                id="tags"
                type="text"
                placeholder="work, family, exercise..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <Input
                id="notes"
                type="text"
                placeholder="What's affecting your mood today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
