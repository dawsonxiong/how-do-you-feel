import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { dateKey, toEntryDate } from "@/lib/dates"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating, tags, notes, date: localDate } = await request.json()

    if (typeof rating !== "number" || rating < 0 || rating > 10) {
      return NextResponse.json(
        { error: "Rating must be a number between 0 and 10" },
        { status: 400 }
      )
    }

    // The client sends its local calendar day (yyyy-MM-dd)
    const date = toEntryDate(localDate)
    if (!date) {
      return NextResponse.json({ error: "Date must be yyyy-MM-dd" }, { status: 400 })
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        rating,
        date,
        tags: tags || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(moodEntry)
  } catch (error) {
    console.error("Error creating mood entry:", error)
    return NextResponse.json({ error: "Failed to create mood entry" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get users whose mood data I can view
    const sharedUsers = await prisma.moodShare.findMany({
      where: {
        toUserId: session.user.id,
      },
      select: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    const allUserIds = [session.user.id, ...sharedUsers.map((share) => share.fromUser.id)]

    // Only the fields the chart plots: notes and tags stay private to their owner
    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        userId: {
          in: allUserIds,
        },
      },
      select: {
        userId: true,
        rating: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    // Average each user's ratings per day
    const days = new Map<string, Map<string, number[]>>()

    for (const entry of moodEntries) {
      const key = dateKey(entry.date)
      const users = days.get(key) ?? new Map<string, number[]>()
      const ratings = users.get(entry.userId) ?? []
      ratings.push(entry.rating)
      users.set(entry.userId, ratings)
      days.set(key, users)
    }

    // Entries are ordered by date, so the map is already in date order
    const data = [...days].map(([date, users]) => ({
      date,
      users: [...users].map(([userId, ratings]) => ({
        userId,
        rating: Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 100) / 100,
        entryCount: ratings.length,
      })),
    }))

    return NextResponse.json({
      data,
      currentUserId: session.user.id,
      sharedUsers: sharedUsers.map((share) => share.fromUser),
    })
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json({ error: "Failed to fetch mood entries" }, { status: 500 })
  }
}
