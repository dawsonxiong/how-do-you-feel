import { NextResponse } from "next/server"
import { formatDistanceToNow } from "date-fns"
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return new Response("Missing API token. Add ?token=YOUR_TOKEN to the URL.", {
        status: 401,
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

    // Get latest mood entry
    const latestEntry = await prisma.moodEntry.findFirst({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      select: {
        rating: true,
        date: true,
        tags: true,
        notes: true,
        updatedAt: true,
      },
    })

    if (!latestEntry) {
      return new Response("No mood entries yet. Log your first mood!", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const label = getMoodLabel(latestEntry.rating)
    const timeAgo = formatDistanceToNow(latestEntry.updatedAt, { addSuffix: true })
    
    let response = `${latestEntry.rating.toFixed(1)} - ${label}\nLogged ${timeAgo}`
    
    if (latestEntry.tags) {
      response += `\nTags: ${latestEntry.tags}`
    }
    
    if (latestEntry.notes) {
      response += `\nNotes: ${latestEntry.notes}`
    }

    return new Response(response, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Error fetching latest mood:", error)
    return new Response("Failed to fetch mood data.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

