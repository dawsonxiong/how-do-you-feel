import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, startOfDay } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const { rating, tags, notes } = await request.json()

    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be a number between 0 and 10' },
        { status: 400 }
      )
    }

    // Set the date to today at midnight for consistency
    const today = startOfDay(new Date())

    const moodEntry = await prisma.moodEntry.create({
      data: {
        rating,
        date: today,
        tags: tags || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(moodEntry)
  } catch (error) {
    console.error('Error creating mood entry:', error)
    return NextResponse.json(
      { error: 'Failed to create mood entry' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all mood entries
    const moodEntries = await prisma.moodEntry.findMany({
      orderBy: {
        date: 'asc',
      },
    })

    // Group by date and calculate daily averages
    const dailyAverages = moodEntries.reduce((acc, entry) => {
      const dateKey = format(entry.date, 'yyyy-MM-dd')
      
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
    }, {} as Record<string, {
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
    }>)

    // Calculate averages and format for chart
    const chartData = Object.values(dailyAverages).map(day => ({
      date: day.date,
      rating: Math.round((day.ratings.reduce((sum, r) => sum + r, 0) / day.ratings.length) * 100) / 100,
      entryCount: day.entries.length,
      entries: day.entries,
    }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error('Error fetching mood entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mood entries' },
      { status: 500 }
    )
  }
}
