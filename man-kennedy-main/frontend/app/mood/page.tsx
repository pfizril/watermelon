"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, TrendingUp, Calendar, BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts"
import { api, MoodEntry as ApiMoodEntry } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { MoodReminderService } from "@/lib/moodReminder"

interface MoodEntryDisplay {
  date: string
  mood: string
  value: number
  note?: string
  timestamp: string
  id?: number
}

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntryDisplay[]>([])
  const [todayMood, setTodayMood] = useState<string | null>(null)
  const [todayMoodEntry, setTodayMoodEntry] = useState<ApiMoodEntry | null>(null)
  const [moodNote, setMoodNote] = useState("")
  const [showJournal, setShowJournal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moodStats, setMoodStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [chartView, setChartView] = useState<'daily' | 'weekly'>('daily')
  const { user } = useAuth()

  // Convert API mood entry to display format
  const convertToDisplay = (entry: ApiMoodEntry): MoodEntryDisplay => {
    const date = new Date(entry.created_at)
    const moodValue = entry.mood === 'very_happy' ? 5 : entry.mood === 'happy' ? 4 : entry.mood === 'neutral' ? 3 : entry.mood === 'sad' ? 2 : 1
    const displayMood = entry.mood === 'very_happy' ? 'happy' : entry.mood === 'very_sad' ? 'sad' : entry.mood
    
    return {
      id: entry.id,
      date: date.toDateString(),
      mood: displayMood,
      value: moodValue,
      note: entry.note || undefined,
      timestamp: entry.created_at,
    }
  }

  // Load mood entries from API
  useEffect(() => {
    if (!user) return

    const loadMoodEntries = async () => {
      try {
        setLoading(true)
        setError(null)
        const entries = await api.getMoodEntries()
        
        // Convert to display format
        const displayEntries = entries.map(convertToDisplay)
        setMoodEntries(displayEntries)

        // Check if there's a mood entry for today
        const today = new Date().toDateString()
        const todayEntry = displayEntries.find(entry => entry.date === today)
        if (todayEntry) {
          setTodayMood(todayEntry.mood)
          // Find the original API entry for today
          const apiEntry = entries.find(e => {
            const entryDate = new Date(e.created_at).toDateString()
            return entryDate === today
          })
          if (apiEntry) {
            setTodayMoodEntry(apiEntry)
            setMoodNote(apiEntry.note || '')
          }
        }
      } catch (err) {
        console.error('Failed to load mood entries:', err)
        setError(err instanceof Error ? err.message : 'Failed to load mood entries')
      } finally {
        setLoading(false)
      }
    }

    loadMoodEntries()
    loadMoodStats()
    
    // Request notification permission and start daily reminder
    if (user) {
      import('@/lib/notifications').then(({ NotificationService }) => {
        NotificationService.requestPermission()
      })
      // Start daily mood reminder at 9 AM
      MoodReminderService.startDailyReminder('09:00')
    }

    return () => {
      MoodReminderService.stopReminder()
    }
  }, [user])

  // Load mood statistics
  const loadMoodStats = async () => {
    if (!user) return

    try {
      setStatsLoading(true)
      const stats = await api.getMoodStats()
      setMoodStats(stats)
    } catch (err) {
      console.error('Failed to load mood stats:', err)
      // Don't show error for stats, it's not critical
    } finally {
      setStatsLoading(false)
    }
  }

  const setMood = async (mood: string) => {
    if (!user) return

    try {
      setSaving(true)
      setError(null)

      // Map frontend mood to backend mood values
      const backendMood = mood === "happy" ? "happy" : mood === "neutral" ? "neutral" : "sad"

      let entry: ApiMoodEntry

      // If today's entry exists, update it; otherwise create new
      if (todayMoodEntry) {
        entry = await api.updateMoodEntry(todayMoodEntry.id, backendMood, moodNote)
      } else {
        entry = await api.createMoodEntry(backendMood, moodNote)
      }

      // Convert to display format
      const displayEntry = convertToDisplay(entry)
      
      // Update today's mood
      setTodayMood(mood)
      setTodayMoodEntry(entry)

      // Update mood history (replace today's entry if exists, otherwise add new)
      const today = new Date().toDateString()
      const updatedEntries = [
        displayEntry,
        ...moodEntries.filter((entry) => entry.date !== today)
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setMoodEntries(updatedEntries)
      setMoodNote("")
      setShowJournal(false)
      
      // Mark reminder as shown if this was triggered by reminder
      MoodReminderService.markReminderShown()
    } catch (err) {
      console.error('Failed to save mood entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to save mood entry')
    } finally {
      setSaving(false)
    }
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
      case "very_happy":
        return "😊"
      case "neutral":
        return "😐"
      case "sad":
      case "very_sad":
        return "😔"
      default:
        return "❓"
    }
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "happy":
        return "bg-green-100 text-green-800 border-green-200"
      case "neutral":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "sad":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const chartData = moodEntries.slice(-7).map((entry) => ({
    date: new Date(entry.timestamp).toLocaleDateString("en-US", { weekday: "short" }),
    mood: entry.value,
    fullDate: entry.date,
  }))

  const averageMood =
    moodEntries.length > 0
      ? (moodEntries.reduce((sum, entry) => sum + entry.value, 0) / moodEntries.length).toFixed(1)
      : "0"

  // Calculate streak (consecutive days with mood entries)
  const calculateStreak = () => {
    if (moodEntries.length === 0) return 0
    
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].timestamp)
      entryDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  const streak = calculateStreak()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mood & Wellness Tracker
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Check-in */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Mood Check-in */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>How are you feeling today?</span>
                </CardTitle>
                <CardDescription>
                  {todayMood
                    ? "You've already checked in today! You can update your mood anytime."
                    : "Take a moment to reflect on your current emotional state."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={todayMood === "happy" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setMood("happy")}
                      className="h-24 flex-col space-y-2"
                      disabled={saving || loading}
                    >
                      <span className="text-3xl">😊</span>
                      <span>Great</span>
                    </Button>
                    <Button
                      variant={todayMood === "neutral" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setMood("neutral")}
                      className="h-24 flex-col space-y-2"
                      disabled={saving || loading}
                    >
                      <span className="text-3xl">😐</span>
                      <span>Okay</span>
                    </Button>
                    <Button
                      variant={todayMood === "sad" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setMood("sad")}
                      className="h-24 flex-col space-y-2"
                      disabled={saving || loading}
                    >
                      <span className="text-3xl">😔</span>
                      <span>Tough</span>
                    </Button>
                  </div>
                  {saving && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving mood entry...
                    </div>
                  )}

                  {!showJournal && (
                    <Button variant="outline" onClick={() => setShowJournal(true)} className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Add a note about your day
                    </Button>
                  )}

                  {showJournal && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="What's on your mind? How was your day? Any thoughts or feelings you'd like to record..."
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={() => setShowJournal(false)} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Mood Trends Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span>Mood Trends & Analysis</span>
                    </CardTitle>
                    <CardDescription>Track your emotional patterns and insights</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={chartView === 'daily' ? 'default' : 'outline'}
                      onClick={() => setChartView('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      size="sm"
                      variant={chartView === 'weekly' ? 'default' : 'outline'}
                      onClick={() => setChartView('weekly')}
                    >
                      Weekly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading || statsLoading ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-spin" />
                      <p>Loading mood data...</p>
                    </div>
                  </div>
                ) : moodStats && (moodStats.daily_breakdown.some((d: any) => d.average !== null) || moodStats.weekly_breakdown.some((w: any) => w.average !== null)) ? (
                  <div className="space-y-6">
                    {/* Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartView === 'daily' ? (
                          <AreaChart data={moodStats.daily_breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                            <Tooltip
                              formatter={(value: number | null) => {
                                if (value === null) return ["No data", "Mood"]
                                if (value >= 4) return [`${value.toFixed(1)} - Great 😊`, "Mood"]
                                if (value >= 3) return [`${value.toFixed(1)} - Okay 😐`, "Mood"]
                                return [`${value.toFixed(1)} - Tough 😔`, "Mood"]
                              }}
                              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                            />
                            <Area
                              type="monotone"
                              dataKey="average"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.3}
                              strokeWidth={2}
                              dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                            />
                          </AreaChart>
                        ) : (
                          <BarChart data={moodStats.weekly_breakdown}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="week_start" 
                              tickFormatter={(value) => {
                                const date = new Date(value)
                                return `Week ${date.getMonth() + 1}/${date.getDate()}`
                              }}
                            />
                            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                            <Tooltip
                              formatter={(value: number | null) => {
                                if (value === null) return ["No data", "Avg Mood"]
                                return [`${value.toFixed(1)}`, "Avg Mood"]
                              }}
                              labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString()}`}
                            />
                            <Bar dataKey="average" fill="#8884d8" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Pattern Insights */}
                    {moodStats.patterns && moodStats.patterns.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Insights</h4>
                        {moodStats.patterns.map((pattern: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg text-sm ${
                              pattern.type === 'improving'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : pattern.type === 'declining'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {pattern.type === 'improving' && '📈 '}
                            {pattern.type === 'declining' && '📉 '}
                            {pattern.type === 'consistent' && '📊 '}
                            {pattern.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Averages Summary */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {moodStats.averages.weekly > 0 ? moodStats.averages.weekly.toFixed(1) : '—'}
                        </div>
                        <p className="text-xs text-gray-600">Weekly Avg</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {moodStats.averages.monthly > 0 ? moodStats.averages.monthly.toFixed(1) : '—'}
                        </div>
                        <p className="text-xs text-gray-600">Monthly Avg</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {moodStats.averages.overall > 0 ? moodStats.averages.overall.toFixed(1) : '—'}
                        </div>
                        <p className="text-xs text-gray-600">Overall Avg</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Start tracking your mood to see trends here!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Journal Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <span>Recent Journal Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodEntries
                    .filter((entry) => entry.note)
                    .slice(-5)
                    .reverse()
                    .map((entry, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{entry.note}</p>
                      </div>
                    ))}
                  {moodEntries.filter((entry) => entry.note).length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No journal entries yet. Start adding notes to your mood check-ins!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & History */}
          <div className="space-y-6">
            {/* Mood Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Mood Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{averageMood}</div>
                  <p className="text-sm text-gray-600">Average Mood Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{streak}</div>
                  <p className="text-sm text-gray-600">Days Tracked</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{todayMood ? getMoodEmoji(todayMood) : "❓"}</div>
                  <p className="text-sm text-gray-600">Today's Mood</p>
                </div>
              </CardContent>
            </Card>

            {/* Mood History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span>Recent History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodEntries
                    .slice(-10)
                    .reverse()
                    .map((entry, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                          <div>
                            <p className="text-sm font-medium">{new Date(entry.timestamp).toLocaleDateString()}</p>
                            {entry.note && <p className="text-xs text-gray-500 truncate max-w-32">{entry.note}</p>}
                          </div>
                        </div>
                        <Badge className={getMoodColor(entry.mood)}>{entry.mood}</Badge>
                      </div>
                    ))}
                  {moodEntries.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No mood entries yet. Start tracking today!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Wellness Tips */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">💡 Wellness Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-green-700">
                  <p>• Take 5 deep breaths when feeling overwhelmed</p>
                  <p>• Go for a short walk to boost your mood</p>
                  <p>• Practice gratitude by listing 3 good things daily</p>
                  <p>• Stay hydrated and get enough sleep</p>
                  <p>• Connect with friends or family when feeling down</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
