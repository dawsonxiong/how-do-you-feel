import { NextResponse } from "next/server"
import { startOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"

const moodLabels: Record<number, string> = {
  0: "terrible",
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

function getMoodLabel(rating: number): string {
  const rounded = Math.round(rating)
  return moodLabels[rounded] || "neutral"
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const ratingParam = searchParams.get("rating")
    const tags = searchParams.get("tags")
    const notes = searchParams.get("notes")

    if (!token) {
      return new Response("Missing API token. Add ?token=YOUR_TOKEN to the URL.", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (!ratingParam) {
      return new Response("Missing rating parameter. Add ?rating=7.5 to the URL.", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const rating = Number.parseFloat(ratingParam)

    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      return new Response("Rating must be a number between 0 and 10.", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Find user by API token
    const user = await prisma.user.findUnique({
      where: { apiToken: token },
      select: { id: true, name: true },
    })

    if (!user) {
      return new Response("Invalid API token.", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Create mood entry
    const today = startOfDay(new Date())
    await prisma.moodEntry.create({
      data: {
        userId: user.id,
        rating,
        date: today,
        tags: tags || null,
        notes: notes || null,
      },
    })

    const label = getMoodLabel(rating)
    let response = `✓ Mood logged: ${rating.toFixed(1)} - ${label}`
    
    if (tags) {
      response += `\nTags: ${tags}`
    }
    
    if (notes) {
      response += `\nNotes: ${notes}`
    }

    return new Response(response, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Error submitting mood:", error)
    return new Response("Failed to log mood. Please try again.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Also support GET for simpler Shortcuts setup
export async function GET(request: Request) {
  return POST(request)
}

