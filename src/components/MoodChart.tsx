"use client"

import { format, parseISO } from "date-fns"
import { Calendar, Eye, EyeOff, TrendingUp } from "lucide-react"
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

interface UserMoodEntry {
  userId: string
  userName: string | null
  userImage: string | null
  rating: number
  entryCount: number
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

interface DayData {
  date: string
  users: UserMoodEntry[]
}

interface SharedUser {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface MoodData {
  data: DayData[]
  currentUserId: string
  sharedUsers: SharedUser[]
}

interface MoodChartProps {
  refreshTrigger?: number
}

// Color palette for different users
const USER_COLORS = [
  "#000000", // Black for first user (white in dark mode)
  "#6366f1", // Indigo for second user
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
]

const CustomTooltip = ({
  active,
  payload,
  label,
  currentUserId,
}: {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    name: string
    color: string
  }>
  label?: string
  currentUserId: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-md max-w-xs">
        <p className="font-medium text-sm mb-2">{format(parseISO(label || ""), "MMM dd, yyyy")}</p>
        <div className="space-y-2">
          {payload.map((entry) => (
            <div key={entry.dataKey} className="border-l-2 pl-2" style={{ borderColor: entry.color }}>
              <p className="text-sm">
                <span className="font-medium">{entry.name}</span>
              </p>
              <p className="text-sm font-medium">{entry.value}/10</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function MoodChart({ refreshTrigger }: MoodChartProps) {
  const [moodData, setMoodData] = useState<MoodData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [visibleUsers, setVisibleUsers] = useState<Set<string>>(new Set())
  const { theme } = useTheme()

  const fetchMoodData = async () => {
    try {
      const response = await fetch("/api/mood")
      if (response.ok) {
        const data: MoodData = await response.json()
        setMoodData(data)
        
        // Initialize all users as visible
        const allUserIds = new Set<string>([data.currentUserId])
        data.sharedUsers.forEach((user) => allUserIds.add(user.id))
        setVisibleUsers(allUserIds)
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleUserVisibility = (userId: string) => {
    setVisibleUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = parseISO(tickItem)
      const totalDays = moodData?.data.length || 0

      if (totalDays <= 7) {
        return format(date, "EEE")
      }

      if (totalDays <= 30) {
        return format(date, isMobile ? "M/d" : "MMM d")
      }

      if (totalDays <= 90) {
        return format(date, isMobile ? "M/d" : "MMM d")
      }

      return format(date, "MMM")
    } catch {
      return tickItem
    }
  }

  const getTickInterval = () => {
    const totalDays = moodData?.data.length || 0

    if (isMobile) {
      if (totalDays <= 7) return 0
      if (totalDays <= 30) return 4
      return Math.max(6, Math.floor(totalDays / 4))
    }

    if (totalDays <= 7) return 0
    if (totalDays <= 14) return 1
    if (totalDays <= 30) return 4
    if (totalDays <= 90) return 6
    return 10
  }

  // Transform data for recharts
  const chartData = moodData?.data.map((day) => {
    const dayEntry: Record<string, string | number> = { date: day.date }
    
    day.users.forEach((user) => {
      dayEntry[`user_${user.userId}`] = user.rating
    })
    
    return dayEntry
  }) || []

  // Get all unique users from the data
  const allUsers = moodData
    ? [
        {
          id: moodData.currentUserId,
          name: "You",
          isCurrentUser: true,
        },
        ...moodData.sharedUsers.map((user) => ({
          id: user.id,
          name: user.name || user.email,
          isCurrentUser: false,
        })),
      ]
    : []

  const getUserColor = (userId: string, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return theme === "dark" ? "#ffffff" : "#000000"
    }
    const index = allUsers.findIndex((u) => u.id === userId)
    return USER_COLORS[index % USER_COLORS.length]
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

  if (!moodData || chartData.length === 0) {
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

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5" />
          history
        </CardTitle>
        
        {/* User toggles */}
        {allUsers.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {allUsers.map((user) => {
              const isVisible = visibleUsers.has(user.id)
              const color = getUserColor(user.id, user.isCurrentUser)
              
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUserVisibility(user.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 text-sm"
                  style={{
                    borderColor: isVisible ? color : "var(--border)",
                    backgroundColor: isVisible ? `${color}10` : "transparent",
                    opacity: isVisible ? 1 : 0.6,
                  }}
                >
                  {isVisible ? (
                    <Eye className="w-3.5 h-3.5 transition-transform" style={{ color }} />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 transition-transform" />
                  )}
                  <span className="font-medium" style={{ color: isVisible ? color : "inherit" }}>
                    {user.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
          <span>
            {chartData.length} {chartData.length === 1 ? "day" : "days"} tracked
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0" style={{ outline: "none", border: "none" }}>
        <div className={`w-full ${isMobile ? "h-80" : "h-64"}`}>
          <ResponsiveContainer width="100%" height="100%" style={{ outline: "none" }}>
            <LineChart
              data={chartData}
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
                content={<CustomTooltip currentUserId={moodData.currentUserId} />}
                allowEscapeViewBox={{ x: false, y: true }}
                cursor={false}
                wrapperStyle={{
                  pointerEvents: "none",
                  outline: "none",
                  border: "none",
                }}
              />
              
              {/* Render a line for each user */}
              {allUsers.map((user) => {
                if (!visibleUsers.has(user.id)) return null
                
                const color = getUserColor(user.id, user.isCurrentUser)
                
                return (
                  <Line
                    key={user.id}
                    type="monotone"
                    dataKey={`user_${user.id}`}
                    name={user.name}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, strokeWidth: 1, r: 3 }}
                    activeDot={{
                      r: 4,
                      stroke: color,
                      strokeWidth: 2,
                      fill: color,
                      style: { pointerEvents: "none" },
                    }}
                    connectNulls={true}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    isAnimationActive={true}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}