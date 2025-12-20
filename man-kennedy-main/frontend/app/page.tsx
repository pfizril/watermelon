"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Brain, Timer, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match!")
          return
        }
        await register(formData.username, formData.email, formData.password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - App showcase */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Smart Desktop Buddies
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your AI-powered companion for better mental health and study productivity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <Heart className="h-8 w-8 text-red-500 mb-2" />
              <h3 className="font-semibold text-sm">Mental Health</h3>
              <p className="text-xs text-gray-600">Mood tracking & wellness</p>
            </Card>
            <Card className="p-4 border-2 border-green-100 hover:border-green-200 transition-colors">
              <Timer className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-sm">Productivity</h3>
              <p className="text-xs text-gray-600">Pomodoro & task management</p>
            </Card>
            <Card className="p-4 border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <Brain className="h-8 w-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-sm">AI Companion</h3>
              <p className="text-xs text-gray-600">Animated desktop buddy</p>
            </Card>
            <Card className="p-4 border-2 border-orange-100 hover:border-orange-200 transition-colors">
              <BarChart3 className="h-8 w-8 text-orange-500 mb-2" />
              <h3 className="font-semibold text-sm">Analytics</h3>
              <p className="text-xs text-gray-600">Behavior monitoring</p>
            </Card>
          </div>
        </div>

        {/* Right side - Auth form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to continue your journey" : "Create your account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
