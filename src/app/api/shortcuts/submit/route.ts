import { getUserFromApiToken } from "@/lib/api-token"
import { toEntryDate } from "@/lib/dates"
import { getMoodLabel } from "@/lib/mood"
import { prisma } from "@/lib/prisma"

function text(body: string, status: number) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ratingParam = searchParams.get("rating")
    const tags = searchParams.get("tags")
    const notes = searchParams.get("notes")

    const user = await getUserFromApiToken(request)
    if (!user) {
      return text("Missing or invalid API token.", 401)
    }

    if (!ratingParam) {
      return text("Missing rating parameter. Add ?rating=7.5 to the URL.", 400)
    }

    const rating = Number.parseFloat(ratingParam)

    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      return text("Rating must be a number between 0 and 10.", 400)
    }

    const date = toEntryDate(searchParams.get("date"), searchParams.get("tz"))
    if (!date) {
      return text("Invalid date or tz parameter.", 400)
    }

    await prisma.moodEntry.create({
      data: {
        userId: user.id,
        rating,
        date,
        tags: tags || null,
        notes: notes || null,
      },
    })

    let response = `✓ Mood logged: ${rating.toFixed(1)} - ${getMoodLabel(rating)}`

    if (tags) {
      response += `\nTags: ${tags}`
    }

    if (notes) {
      response += `\nNotes: ${notes}`
    }

    return text(response, 200)
  } catch (error) {
    console.error("Error submitting mood:", error)
    return text("Failed to log mood. Please try again.", 500)
  }
}

// Kept for shortcuts created before POST was the documented method
export async function GET(request: Request) {
  return POST(request)
}
