import { formatDistanceToNow } from "date-fns"
import { getUserFromApiToken } from "@/lib/api-token"
import { getMoodLabel } from "@/lib/mood"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const user = await getUserFromApiToken(request)
    if (!user) {
      return new Response("Missing or invalid API token.", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Get latest mood entry
    const latestEntry = await prisma.moodEntry.findFirst({
      where: { userId: user.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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
