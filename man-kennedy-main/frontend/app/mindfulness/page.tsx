"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"

interface MindfulnessSession {
  id: string
  type: "breathing" | "meditation" | "quote"
  duration: number
  completedAt: string
}

export default function Mindfulness() {
  const [sessions, setSessions] = useState<MindfulnessSession[]>([])
  const [currentSession, setCurrentSession] = useState<"breathing" | "meditation" | null>(null)
  const [sessionTime, setSessionTime] = useState(0)
  const [totalTime, setTotalTime] = useState(300) // 5 minutes default
  const [isRunning, setIsRunning] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [breathingCount, setBreathingCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentQuote, setCurrentQuote] = useState(0)

  const quotes = [
    "The present moment is the only time over which we have dominion. - Thích Nhất Hạnh",
    "Wherever you are, be there totally. - Eckhart Tolle",
    "Peace comes from within. Do not seek it without. - Buddha",
    "The mind is everything. What you think you become. - Buddha",
    "In the midst of winter, I found there was, within me, an invincible summer. - Albert Camus",
    "You have power over your mind - not outside events. Realize this, and you will find strength. - Marcus Aurelius",
    "The best way to take care of the future is to take care of the present moment. - Thích Nhất Hạnh",
    "Mindfulness is a way of befriending ourselves and our experience. - Jon Kabat-Zinn",
  ]

  useEffect(() => {
    const savedSessions = localStorage.getItem("smartBuddyMindfulnessSessions")
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }

    // Rotate quotes every 10 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 10000)

    return () => clearInterval(quoteInterval)
  }, [quotes.length])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && sessionTime < totalTime) {
      interval = setInterval(() => {
        setSessionTime((time) => time + 1)
      }, 1000)
    } else if (sessionTime >= totalTime && isRunning) {
      completeSession()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, sessionTime, totalTime])

  useEffect(() => {
    // Breathing exercise timing
    if (currentSession === "breathing" && isRunning) {
      const breathingInterval = setInterval(() => {
        setBreathingCount((prev) => {
          const newCount = prev + 1
          const cycle = newCount % 16 // 4 seconds inhale, 4 hold, 8 exhale

          if (cycle < 4) {
            setBreathingPhase("inhale")
          } else if (cycle < 8) {
            setBreathingPhase("hold")
          } else {
            setBreathingPhase("exhale")
          }

          return newCount
        })
      }, 1000)

      return () => clearInterval(breathingInterval)
    }
  }, [currentSession, isRunning])

  const startSession = (type: "breathing" | "meditation", duration: number) => {
    setCurrentSession(type)
    setTotalTime(duration)
    setSessionTime(0)
    setIsRunning(true)
    setBreathingCount(0)
    setBreathingPhase("inhale")
  }

  const pauseSession = () => {
    setIsRunning(!isRunning)
  }

  const resetSession = () => {
    setIsRunning(false)
    setSessionTime(0)
    setBreathingCount(0)
    setBreathingPhase("inhale")
  }

  const completeSession = () => {
    if (!currentSession) return

    const session: MindfulnessSession = {
      id: Date.now().toString(),
      type: currentSession,
      duration: totalTime,
      completedAt: new Date().toISOString(),
    }

    const updatedSessions = [...sessions, session]
    setSessions(updatedSessions)
    localStorage.setItem("smartBuddyMindfulnessSessions", JSON.stringify(updatedSessions))

    setIsRunning(false)
    setCurrentSession(null)
    setSessionTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case "inhale":
        return "Breathe In..."
      case "hold":
        return "Hold..."
      case "exhale":
        return "Breathe Out..."
    }
  }

  const getBreathingCircleSize = () => {
    switch (breathingPhase) {
      case "inhale":
        return "w-32 h-32"
      case "hold":
        return "w-32 h-32"
      case "exhale":
        return "w-20 h-20"
    }
  }

  const totalSessionsToday = sessions.filter(
    (session) => new Date(session.completedAt).toDateString() === new Date().toDateString(),
  ).length

  const totalMinutesToday =
    sessions
      .filter((session) => new Date(session.completedAt).toDateString() === new Date().toDateString())
      .reduce((sum, session) => sum + session.duration, 0) / 60

  const streak = sessions.length > 0 ? Math.min(sessions.length, 30) : 0

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
              Mindfulness & Meditation
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Active Session */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Quote */}
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-4">🌸</div>
                <blockquote className="text-lg italic text-purple-800 mb-4">"{quotes[currentQuote]}"</blockquote>
                <p className="text-sm text-purple-600">Daily Mindfulness Quote</p>
              </CardContent>
            </Card>

            {/* Active Session */}
            {currentSession ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span className="text-2xl">{currentSession === "breathing" ? "🫁" : "🧘"}</span>
                      <span>{currentSession === "breathing" ? "Breathing Exercise" : "Meditation Session"}</span>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6">
                    {currentSession === "breathing" && (
                      <div className="flex flex-col items-center space-y-6">
                        <div
                          className={`rounded-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-1000 ${getBreathingCircleSize()}`}
                        ></div>
                        <div className="text-2xl font-semibold text-blue-600">{getBreathingInstruction()}</div>
                      </div>
                    )}

                    {currentSession === "meditation" && (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="text-6xl">🧘‍♀️</div>
                        <div className="text-xl text-gray-600">Find your center. Focus on your breath.</div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="text-4xl font-mono font-bold text-blue-600">
                        {formatTime(totalTime - sessionTime)}
                      </div>
                      <Progress value={(sessionTime / totalTime) * 100} className="w-full h-3" />
                    </div>

                    <div className="flex justify-center space-x-4">
                      <Button onClick={pauseSession} size="lg" className="bg-blue-600 hover:bg-blue-700">
                        {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isRunning ? "Pause" : "Resume"}
                      </Button>
                      <Button onClick={resetSession} variant="outline" size="lg">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button onClick={completeSession} variant="outline" size="lg">
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Practice</CardTitle>
                  <CardDescription>Select a mindfulness exercise to begin your session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Breathing Exercises */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <span className="text-2xl">🫁</span>
                        <span>Breathing Exercises</span>
                      </h3>
                      <div className="space-y-2">
                        <Button
                          onClick={() => startSession("breathing", 180)}
                          variant="outline"
                          className="w-full justify-start h-12"
                        >
                          <div className="text-left">
                            <div className="font-medium">Quick Breathing (3 min)</div>
                            <div className="text-xs text-gray-500">4-4-8 breathing pattern</div>
                          </div>
                        </Button>
                        <Button
                          onClick={() => startSession("breathing", 300)}
                          variant="outline"
                          className="w-full justify-start h-12"
                        >
                          <div className="text-left">
                            <div className="font-medium">Standard Breathing (5 min)</div>
                            <div className="text-xs text-gray-500">Calm your nervous system</div>
                          </div>
                        </Button>
                        <Button
                          onClick={() => startSession("breathing", 600)}
                          variant="outline"
                          className="w-full justify-start h-12"
                        >
                          <div className="text-left">
                            <div className="font-medium">Deep Breathing (10 min)</div>
                            <div className="text-xs text-gray-500">Extended relaxation</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Meditation Sessions */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <span className="text-2xl">🧘</span>
                        <span>Meditation</span>
                      </h3>
                      <div className="space-y-2">
                        <Button
                          onClick={() => startSession("meditation", 300)}
                          variant="outline"
                          className="w-full justify-start h-12"
                        >
                          <div className="text-left">
                            <div className="font-medium">Beginner Meditation (5 min)</div>
                            <div className="text-xs text-gray-500">Perfect for starting out</div>
                          </div>
                        </Button>
                        <Button
                          onClick={() => startSession("meditation", 600)}
                          variant="outline"
                          className="w-full justify-start h-12"
                        >
                          <div className="text-left">
                            <div className="font-medium">Focus Meditation (10 min)</div>
                            <div className="text-xs text-gray-500">Improve concentration</div>
                          </div>
                        </Button>
                        <Button
                          onClick={() => startSession("meditation", 900)}
                          variant="outline"
                          className="w-full justify-start h-12"
                        >
                          <div className="text-left">
                            <div className="font-medium">Deep Meditation (15 min)</div>
                            <div className="text-xs text-gray-500">Advanced practice</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & History */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Practice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{totalSessionsToday}</div>
                  <p className="text-sm text-gray-600">Sessions Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{Math.round(totalMinutesToday)}</div>
                  <p className="text-sm text-gray-600">Minutes Practiced</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{streak}</div>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions
                    .slice(-5)
                    .reverse()
                    .map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{session.type === "breathing" ? "🫁" : "🧘"}</span>
                          <div>
                            <p className="text-sm font-medium">
                              {session.type === "breathing" ? "Breathing" : "Meditation"}
                            </p>
                            <p className="text-xs text-gray-500">{Math.round(session.duration / 60)} minutes</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  {sessions.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No sessions yet. Start your first practice!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">🌱 Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-green-700">
                  <p>• Reduces stress and anxiety</p>
                  <p>• Improves focus and concentration</p>
                  <p>• Better emotional regulation</p>
                  <p>• Enhanced sleep quality</p>
                  <p>• Increased self-awareness</p>
                  <p>• Boosts overall well-being</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-orange-800">💡 Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-orange-700">
                  <p>• Find a quiet, comfortable space</p>
                  <p>• Start with shorter sessions</p>
                  <p>• Be consistent with daily practice</p>
                  <p>• Don't judge your thoughts</p>
                  <p>• Focus on your breath as an anchor</p>
                  <p>• Practice self-compassion</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
