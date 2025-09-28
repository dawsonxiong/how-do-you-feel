'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { TrendingUp, Calendar } from 'lucide-react'

interface MoodData {
  date: string
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

interface MoodChartProps {
  refreshTrigger?: number
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{
    payload: MoodData
    value: number
  }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg p-3 shadow-md">
        <p className="font-medium">{format(parseISO(label || ''), 'MMM dd, yyyy')}</p>
        <p className="text-primary">
          <span className="font-medium">Mood: {payload[0].value}</span>
          <span className="text-muted-foreground ml-2">
            ({data.entryCount} {data.entryCount === 1 ? 'entry' : 'entries'})
          </span>
        </p>
        {data.entries.length > 0 && data.entries[0].notes && (
          <p className="text-sm text-muted-foreground mt-1">
            "{data.entries[0].notes}"
          </p>
        )}
      </div>
    )
  }
  return null
}

export function MoodChart({ refreshTrigger }: MoodChartProps) {
  const [data, setData] = useState<MoodData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMoodData = async () => {
    try {
      const response = await fetch('/api/mood')
      if (response.ok) {
        const moodData = await response.json()
        setData(moodData)
      }
    } catch (error) {
      console.error('Error fetching mood data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMoodData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = parseISO(tickItem)
      return format(date, 'MMM dd')
    } catch {
      return tickItem
    }
  }

  const getAverageRating = () => {
    if (data.length === 0) return 0
    return Math.round((data.reduce((sum, entry) => sum + entry.rating, 0) / data.length) * 100) / 100
  }

  const getRecentTrend = () => {
    if (data.length < 2) return null
    const recent = data.slice(-7) // Last 7 entries
    if (recent.length < 2) return null
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2))
    const secondHalf = recent.slice(Math.floor(recent.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.rating, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.rating, 0) / secondHalf.length
    
    const difference = secondAvg - firstAvg
    
    if (Math.abs(difference) < 0.1) return 'stable'
    return difference > 0 ? 'improving' : 'declining'
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Mood Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading your mood data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Mood Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground">
              No mood entries yet. Add your first entry above to start tracking your mood journey!
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const trend = getRecentTrend()
  const averageRating = getAverageRating()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Your Mood Journey
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Average: {averageRating}/10</span>
          {trend && (
            <span className={`font-medium ${
              trend === 'improving' ? 'text-green-600' : 
              trend === 'declining' ? 'text-red-600' : 
              'text-blue-600'
            }`}>
              Recent trend: {trend}
            </span>
          )}
          <span>{data.length} {data.length === 1 ? 'day' : 'days'} tracked</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxisLabel}
                className="text-xs"
              />
              <YAxis 
                domain={[0, 10]} 
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
