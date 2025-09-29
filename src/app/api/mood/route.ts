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

    // Get mood entries for the authenticated user only
    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "asc",
      },
    })

    // Group by date and calculate daily averages
    interface DayData {
      date: string
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

    const dailyAverages = moodEntries.reduce(
      (acc: Record<string, DayData>, entry: (typeof moodEntries)[0]) => {
        const dateKey = format(entry.date, "yyyy-MM-dd")

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            ratings: [],
            entries: [],
          }
        }

        acc[dateKey].ratings.push(entry.rating)
        acc[dateKey].entries.push(entry)

        return acc
      },
      {} as Record<string, DayData>
    )

    // Calculate averages for days with data
    const dayData = (Object.values(dailyAverages) as DayData[]).map((day) => ({
      date: day.date,
      rating:
        Math.round(
          (day.ratings.reduce((sum: number, r: number) => sum + r, 0) / day.ratings.length) * 100
        ) / 100,
      entryCount: day.entries.length,
      entries: day.entries,
    }))

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

    // For now, just return the actual data points (no gaps)
    // This avoids chart rendering issues with null values
    const sortedData = dayData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json(
      sortedData.map((item) => ({
        ...item,
        hasData: true,
      }))
    )
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json({ error: "Failed to fetch mood entries" }, { status: 500 })
  }
}
