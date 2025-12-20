"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, TrendingUp, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MoodEntry {
  date: string
  mood: string
  value: number
  note?: string
  timestamp: string
}

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<string | null>(null)
  const [moodNote, setMoodNote] = useState("")
  const [showJournal, setShowJournal] = useState(false)

  useEffect(() => {
    // Load mood history
    const savedMoods = localStorage.getItem("smartBuddyMoodHistory")
    if (savedMoods) {
      setMoodEntries(JSON.parse(savedMoods))
    }

    // Load today's mood
    const savedTodayMood = localStorage.getItem("smartBuddyTodayMood")
    if (savedTodayMood) {
      const moodData = JSON.parse(savedTodayMood)
      const today = new Date().toDateString()
      if (moodData.date === today) {
        setTodayMood(moodData.mood)
      }
    }
  }, [])

  const setMood = (mood: string) => {
    const today = new Date().toDateString()
    const moodValue = mood === "happy" ? 3 : mood === "neutral" ? 2 : 1

    const newEntry: MoodEntry = {
      date: today,
      mood: mood,
      value: moodValue,
      note: moodNote,
      timestamp: new Date().toISOString(),
    }

    // Update today's mood
    setTodayMood(mood)
    localStorage.setItem(
      "smartBuddyTodayMood",
      JSON.stringify({
        date: today,
        mood: mood,
        timestamp: new Date().toISOString(),
      }),
    )

    // Update mood history
    const updatedEntries = [...moodEntries.filter((entry) => entry.date !== today), newEntry]
    setMoodEntries(updatedEntries)
    localStorage.setItem("smartBuddyMoodHistory", JSON.stringify(updatedEntries))

    setMoodNote("")
    setShowJournal(false)
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊"
      case "neutral":
        return "😐"
      case "sad":
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

  const streak = moodEntries.length > 0 ? moodEntries.length : 0

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
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={todayMood === "happy" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setMood("happy")}
                      className="h-24 flex-col space-y-2"
                    >
                      <span className="text-3xl">😊</span>
                      <span>Great</span>
                    </Button>
                    <Button
                      variant={todayMood === "neutral" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setMood("neutral")}
                      className="h-24 flex-col space-y-2"
                    >
                      <span className="text-3xl">😐</span>
                      <span>Okay</span>
                    </Button>
                    <Button
                      variant={todayMood === "sad" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setMood("sad")}
                      className="h-24 flex-col space-y-2"
                    >
                      <span className="text-3xl">😔</span>
                      <span>Tough</span>
                    </Button>
                  </div>

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

            {/* Mood Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>7-Day Mood Trend</span>
                </CardTitle>
                <CardDescription>Track your emotional patterns over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[1, 3]} ticks={[1, 2, 3]} />
                        <Tooltip
                          formatter={(value: number) => [
                            value === 3 ? "Great 😊" : value === 2 ? "Okay 😐" : "Tough 😔",
                            "Mood",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="#8884d8"
                          strokeWidth={3}
                          dot={{ fill: "#8884d8", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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
