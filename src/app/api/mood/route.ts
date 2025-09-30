import { format, startOfDay } from "date-fns"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { rating, tags, notes } = await request.json()

    if (typeof rating !== "number" || rating < 0 || rating > 10) {
      return NextResponse.json(
        { error: "Rating must be a number between 0 and 10" },
        { status: 400 }
      )
    }

    // Set the date to today at midnight for consistency
    const today = startOfDay(new Date())

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        rating,
        date: today,
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
        fromUserId: true,
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

    const sharedUserIds = sharedUsers.map((share) => share.fromUserId)
    const allUserIds = [session.user.id, ...sharedUserIds]

    // Get mood entries for the authenticated user AND users sharing with them
    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        userId: {
          in: allUserIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Group by date AND user, then calculate daily averages per user
    interface UserDayData {
      date: string
      users: Record<
        string,
        {
          userId: string
          userName: string | null
          userImage: string | null
          ratings: number[]
          entries: Array<{
            id: string
            rating: number
            date: Date
            tags: string | null
            notes: string | null
            createdAt: Date
            updatedAt: Date
          }>
        }
      >
    }

    const dailyData = moodEntries.reduce(
      (acc: Record<string, UserDayData>, entry: (typeof moodEntries)[0]) => {
        const dateKey = format(entry.date, "yyyy-MM-dd")

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            users: {},
          }
        }

        if (!acc[dateKey].users[entry.userId]) {
          acc[dateKey].users[entry.userId] = {
            userId: entry.userId,
            userName: entry.user.name,
            userImage: entry.user.image,
            ratings: [],
            entries: [],
          }
        }

        acc[dateKey].users[entry.userId].ratings.push(entry.rating)
        acc[dateKey].users[entry.userId].entries.push({
          id: entry.id,
          rating: entry.rating,
          date: entry.date,
          tags: entry.tags,
          notes: entry.notes,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        })

        return acc
      },
      {} as Record<string, UserDayData>
    )

    // Calculate averages for days with data, organized by user
    const dayData = (Object.values(dailyData) as UserDayData[]).map((day) => {
      const userDataArray = Object.values(day.users).map((userData) => ({
        userId: userData.userId,
        userName: userData.userName,
        userImage: userData.userImage,
        rating:
          Math.round(
            (userData.ratings.reduce((sum: number, r: number) => sum + r, 0) /
              userData.ratings.length) *
              100
          ) / 100,
        entryCount: userData.entries.length,
        entries: userData.entries,
      }))

      return {
        date: day.date,
        users: userDataArray,
      }
    })

    // Create continuous time series based on actual data range
    let startDate: Date
    let endDate: Date

    if (dayData.length > 0) {
      // Use actual data range with some padding
      const dates = dayData.map((d) => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime())
      startDate = new Date(dates[0])
      endDate = new Date(dates[dates.length - 1])

      // Add padding: 7 days before first entry, 3 days after last entry
      startDate.setDate(startDate.getDate() - 7)
      endDate.setDate(endDate.getDate() + 3)

      // But limit maximum range to 90 days to avoid chart performance issues
      const maxDays = 90
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff > maxDays) {
        // Show last 90 days of the data range
        startDate = new Date(endDate)
        startDate.setDate(endDate.getDate() - maxDays)
      }
    } else {
      // Fallback to last 30 days if no data
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 30)
    }

    // Sort by date and return with metadata
    const sortedData = dayData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Get user info for all shared users
    const sharedUsersInfo = sharedUsers.map((share) => ({
      id: share.fromUser.id,
      name: share.fromUser.name,
      email: share.fromUser.email,
      image: share.fromUser.image,
    }))

    return NextResponse.json({
      data: sortedData,
      currentUserId: session.user.id,
      sharedUsers: sharedUsersInfo,
    })
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json({ error: "Failed to fetch mood entries" }, { status: 500 })
  }
}
