"use client"

import { format, parseISO } from "date-fns"
import { Calendar, TrendingUp } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MoodData {
  date: string
  rating: number
  entryCount: number
  hasData: boolean
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

interface MoodChartProps {
  refreshTrigger?: number
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{
    payload: MoodData
    value: number
  }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    // All data points should have data now

    const hasMultipleEntries = data.entryCount > 1

    return (
      <div className="bg-background border rounded-lg p-3 shadow-md max-w-xs">
        <p className="font-medium text-sm">{format(parseISO(label || ""), "MMM dd, yyyy")}</p>
        <p className="text-primary">
          <span className="font-medium text-sm">
            {hasMultipleEntries ? `Average: ${payload[0].value}` : `mood: ${payload[0].value}`}
          </span>
          <span className="text-muted-foreground ml-2 text-sm">
            ({data.entryCount} {data.entryCount === 1 ? "entry" : "entries"})
          </span>
        </p>

        {/* Show details for multiple entries */}
        {hasMultipleEntries ? (
          <div className="mt-2 space-y-1">
            {data.entries.map((entry) => (
              <div key={entry.id} className="text-xs border-l-2 border-muted pl-2">
                <span className="font-medium text-primary">{entry.rating}</span>
                {entry.tags && (
                  <span className="text-muted-foreground ml-2">
                    #{entry.tags.replace(/,/g, " #")}
                  </span>
                )}
                {entry.notes && <p className="text-muted-foreground mt-0.5">"{entry.notes}"</p>}
              </div>
            ))}
          </div>
        ) : (
          // Single entry details
          <div className="mt-2">
            {data.entries[0]?.tags && (
              <p className="text-xs text-muted-foreground">
                #{data.entries[0].tags.replace(/,/g, " #")}
              </p>
            )}
            {data.entries[0]?.notes && (
              <p className="text-sm text-muted-foreground mt-1">"{data.entries[0].notes}"</p>
            )}
          </div>
        )}
      </div>
    )
  }
  return null
}

export function MoodChart({ refreshTrigger }: MoodChartProps) {
  const [data, setData] = useState<MoodData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()

  // Get line color based on theme
  const lineColor = theme === "dark" ? "#ffffff" : "#000000"

  const fetchMoodData = async () => {
    try {
      const response = await fetch("/api/mood")
      if (response.ok) {
        const moodData = await response.json()
        setData(moodData)
      }
    } catch (error) {
      console.error("Error fetching mood data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMoodData()
  }, [refreshTrigger])

  useEffect(() => {
    // Check mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = parseISO(tickItem)
      const now = new Date()
      const daysDiff = Math.abs((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      // Adaptive formatting based on recency
      if (daysDiff < 7) {
        return format(date, "EEE") // "Mon", "Tue"
      }
      if (daysDiff < 30) {
        return format(date, "MMM dd") // "Sep 15"
      }
      return format(date, "MMM dd") // Keep consistent for 30-day view
    } catch {
      return tickItem
    }
  }

  const getTickInterval = () => {
    if (isMobile) {
      // Much more spacing on mobile to prevent overlap
      if (data.length <= 7) {
        return 1 // Show every other day
      }
      return Math.max(6, Math.floor(data.length / 4)) // Show ~4 labels max on mobile
    }

    // Desktop spacing (original logic)
    if (data.length <= 7) {
      return 0 // Show all days
    }
    if (data.length <= 30) {
      return 2 // Show every 3rd day
    }
    if (data.length <= 60) {
      return 4 // Show every 5th day
    }
    return 6 // Show every 7th day for longer periods
  }

  const getAverageRating = () => {
    if (data.length === 0) return 0
    return (
      Math.round((data.reduce((sum, entry) => sum + entry.rating, 0) / data.length) * 100) / 100
    )
  }

  const getRecentTrend = () => {
    if (data.length < 4) return null

    const recent = data.slice(-10) // Last 10 entries
    if (recent.length < 4) return null

    const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
    const secondHalf = recent.slice(Math.floor(recent.length / 2))

    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.rating, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.rating, 0) / secondHalf.length

    const difference = secondAvg - firstAvg

    if (Math.abs(difference) < 0.1) return "stable"
    return difference > 0 ? "improving" : "declining"
  }

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5" />
            history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5" />
            history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              no mood entries yet. add your first entry above to start tracking
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const trend = getRecentTrend()
  const averageRating = getAverageRating()

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5" />
          history
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>average: {averageRating}/10</span>
          {trend && (
            <>
              <span>|</span>
              <span
                className={`font-medium ${
                  trend === "improving"
                    ? "text-green-600"
                    : trend === "declining"
                      ? "text-red-600"
                      : "text-blue-600"
                }`}
              >
                recent trend: {trend}
              </span>
            </>
          )}
          <span>|</span>
          <span>
            {data.length} {data.length === 1 ? "day" : "days"} tracked
          </span>
        </div>
      </CardHeader>
      <CardContent style={{ outline: "none", border: "none" }}>
        <div className={`w-full ${isMobile ? "h-80" : "h-64"}`}>
          <ResponsiveContainer width="100%" height="100%" style={{ outline: "none" }}>
            <LineChart
              data={data}
              style={{
                outline: "none",
                border: "none",
                userSelect: "none",
                WebkitTapHighlightColor: "transparent",
              }}
              margin={{
                top: 20,
                right: 40,
                bottom: isMobile ? 60 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                type="category"
                tickFormatter={formatXAxisLabel}
                className="text-xs"
                interval={getTickInterval()}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 30}
              />
              <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} className="text-xs" />
              <Tooltip
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: false, y: true }}
                cursor={false}
                wrapperStyle={{
                  pointerEvents: "none",
                  outline: "none",
                  border: "none",
                }}
              />
              <Line
                type="linear"
                dataKey="rating"
                stroke={lineColor}
                strokeWidth={2}
                dot={{ fill: lineColor, strokeWidth: 1, r: 3 }}
                activeDot={{
                  r: 3,
                  stroke: lineColor,
                  strokeWidth: 2,
                  fill: lineColor,
                  style: { pointerEvents: "none" },
                }}
                connectNulls={false}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
