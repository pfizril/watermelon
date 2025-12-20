"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, Clock, Target, TrendingUp, AlertTriangle, Activity } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AnalyticsData {
  date: string
  focusTime: number
  tasksCompleted: number
  mood: number
  screenTime: number
  breaks: number
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d")

  useEffect(() => {
    // Generate mock analytics data
    const generateMockData = () => {
      const data: AnalyticsData[] = []
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        data.push({
          date: date.toISOString().split("T")[0],
          focusTime: Math.floor(Math.random() * 240) + 60, // 60-300 minutes
          tasksCompleted: Math.floor(Math.random() * 8) + 2, // 2-10 tasks
          mood: Math.floor(Math.random() * 3) + 1, // 1-3 mood scale
          screenTime: Math.floor(Math.random() * 480) + 240, // 4-12 hours
          breaks: Math.floor(Math.random() * 6) + 2, // 2-8 breaks
        })
      }

      return data
    }

    setAnalyticsData(generateMockData())
  }, [timeRange])

  const totalFocusTime = analyticsData.reduce((sum, day) => sum + day.focusTime, 0)
  const averageFocusTime = analyticsData.length > 0 ? Math.round(totalFocusTime / analyticsData.length) : 0
  const totalTasksCompleted = analyticsData.reduce((sum, day) => sum + day.tasksCompleted, 0)
  const averageMood =
    analyticsData.length > 0
      ? (analyticsData.reduce((sum, day) => sum + day.mood, 0) / analyticsData.length).toFixed(1)
      : "0"

  const chartData = analyticsData.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    focusTime: Math.round(day.focusTime / 60), // Convert to hours
    tasks: day.tasksCompleted,
    mood: day.mood,
    screenTime: Math.round(day.screenTime / 60), // Convert to hours
    breaks: day.breaks,
  }))

  const productivityData = [
    { name: "Focus Time", value: averageFocusTime, color: "#8884d8" },
    { name: "Break Time", value: Math.round(averageFocusTime * 0.2), color: "#82ca9d" },
    { name: "Idle Time", value: Math.round(averageFocusTime * 0.3), color: "#ffc658" },
  ]

  const burnoutRisk = () => {
    const recentData = analyticsData.slice(-3)
    if (recentData.length < 3) return "low"

    const avgScreenTime = recentData.reduce((sum, day) => sum + day.screenTime, 0) / recentData.length
    const avgBreaks = recentData.reduce((sum, day) => sum + day.breaks, 0) / recentData.length
    const avgMood = recentData.reduce((sum, day) => sum + day.mood, 0) / recentData.length

    if (avgScreenTime > 600 && avgBreaks < 4 && avgMood < 2) return "high"
    if (avgScreenTime > 480 && avgBreaks < 5) return "medium"
    return "low"
  }

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const currentBurnoutRisk = burnoutRisk()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Behavior Analytics
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
                7 Days
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30d")}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90d")}
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Focus Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(averageFocusTime / 60)}h {averageFocusTime % 60}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-600">{totalTasksCompleted}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Mood</p>
                  <p className="text-2xl font-bold text-purple-600">{averageMood}/3</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Burnout Risk</p>
                  <Badge className={getBurnoutColor(currentBurnoutRisk)}>{currentBurnoutRisk.toUpperCase()}</Badge>
                </div>
                <AlertTriangle
                  className={`h-8 w-8 ${
                    currentBurnoutRisk === "high"
                      ? "text-red-500"
                      : currentBurnoutRisk === "medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Focus Time Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Focus Time Trend</span>
              </CardTitle>
              <CardDescription>Daily focus time over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} hours`, "Focus Time"]} />
                    <Line
                      type="monotone"
                      dataKey="focusTime"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Task Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-500" />
                <span>Task Completion</span>
              </CardTitle>
              <CardDescription>Daily tasks completed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value} tasks`, "Completed"]} />
                    <Bar dataKey="tasks" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productivity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span>Time Distribution</span>
              </CardTitle>
              <CardDescription>How you spend your time on average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productivityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${Math.round(value / 60)}h`}
                    >
                      {productivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${Math.round(value / 60)} hours`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Burnout Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Burnout Analysis</span>
              </CardTitle>
              <CardDescription>Factors contributing to burnout risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Screen Time</span>
                  <Badge
                    className={
                      analyticsData.slice(-3).reduce((sum, day) => sum + day.screenTime, 0) / 3 > 600
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {Math.round(analyticsData.slice(-3).reduce((sum, day) => sum + day.screenTime, 0) / 3 / 60)}h/day
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Break Frequency</span>
                  <Badge
                    className={
                      analyticsData.slice(-3).reduce((sum, day) => sum + day.breaks, 0) / 3 < 4
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {Math.round(analyticsData.slice(-3).reduce((sum, day) => sum + day.breaks, 0) / 3)}/day
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mood Trend</span>
                  <Badge
                    className={
                      Number.parseFloat(averageMood) < 2 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }
                  >
                    {averageMood}/3
                  </Badge>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-700">
                  {currentBurnoutRisk === "high" &&
                    "⚠️ High burnout risk detected. Consider taking more breaks and reducing screen time."}
                  {currentBurnoutRisk === "medium" &&
                    "⚡ Moderate burnout risk. Try to balance work with regular breaks."}
                  {currentBurnoutRisk === "low" && "✅ Low burnout risk. Keep up the healthy work habits!"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">💡 Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-700">
                {averageFocusTime < 120 && <p>• Try increasing focus sessions gradually</p>}
                {analyticsData.slice(-3).reduce((sum, day) => sum + day.breaks, 0) / 3 < 5 && (
                  <p>• Take more frequent breaks (every 25-30 minutes)</p>
                )}
                {Number.parseFloat(averageMood) < 2.5 && <p>• Consider mood-boosting activities like exercise</p>}
                <p>• Use the Pomodoro technique for better focus</p>
                <p>• Set realistic daily goals</p>
                <p>• Practice mindfulness during breaks</p>
                {currentBurnoutRisk !== "low" && <p>• Consider reducing workload temporarily</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Detailed Insights</CardTitle>
            <CardDescription>Comprehensive analysis of your productivity patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Productivity Patterns</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    • Your most productive days tend to be when you complete{" "}
                    {Math.max(...analyticsData.map((d) => d.tasksCompleted))} or more tasks
                  </p>
                  <p>• Focus sessions averaging {Math.round(averageFocusTime / 60)} hours show optimal concentration</p>
                  <p>
                    • Taking{" "}
                    {Math.round(analyticsData.reduce((sum, day) => sum + day.breaks, 0) / analyticsData.length)} breaks
                    per day maintains energy levels
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Wellness Indicators</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    • Mood correlation with task completion:{" "}
                    {Number.parseFloat(averageMood) > 2.5 ? "Strong" : "Moderate"}
                  </p>
                  <p>
                    • Screen time impact on mood:{" "}
                    {analyticsData.slice(-3).reduce((sum, day) => sum + day.screenTime, 0) / 3 > 600
                      ? "Negative"
                      : "Neutral"}
                  </p>
                  <p>
                    • Break frequency supports sustained focus:{" "}
                    {analyticsData.slice(-3).reduce((sum, day) => sum + day.breaks, 0) / 3 > 5
                      ? "Yes"
                      : "Needs improvement"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
