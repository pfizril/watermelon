"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Settings, User, Palette, Bell, Shield, Download, Trash2, Calendar, RefreshCw, Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { api, CalendarConnection } from "@/lib/api"

interface Preferences {
  studyDuration: number
  breakDuration: number
  theme: string
  buddyName: string
  buddyAppearance: string
  voiceEnabled: boolean
  notificationsEnabled: boolean
  breakReminders: boolean
  motivationalQuotes: boolean
  soundEffects: boolean
  autoStartBreaks: boolean
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<Preferences>({
    studyDuration: 25,
    breakDuration: 5,
    theme: "light",
    buddyName: "Buddy",
    buddyAppearance: "cat",
    voiceEnabled: true,
    notificationsEnabled: true,
    breakReminders: true,
    motivationalQuotes: true,
    soundEffects: true,
    autoStartBreaks: false,
  })
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([])
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState<number | null>(null) // connection ID being synced
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    // If you want to load preferences from user, do it here
    // For now, just use defaults or extend user object if you add preferences to backend
    
    // Load calendar connections
    loadCalendarConnections()
    
    // Check for OAuth callback success/error in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const calendarConnected = urlParams.get('calendar_connected')
      const calendarError = urlParams.get('calendar_error')
      
      if (calendarConnected === 'true') {
        // Reload connections after successful OAuth
        setTimeout(() => {
          loadCalendarConnections()
          // Remove query param
          router.replace('/settings')
        }, 1000)
      } else if (calendarError) {
        alert(`Calendar connection error: ${calendarError}`)
        router.replace('/settings')
      }
    }
  }, [user, router])

  const loadCalendarConnections = async () => {
    if (!user) return
    setCalendarLoading(true)
    try {
      const connections = await api.getCalendarConnections()
      setCalendarConnections(connections)
    } catch (error) {
      console.error('Failed to load calendar connections:', error)
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const result = await api.connectGoogleCalendar()
      // Redirect to Google OAuth
      window.location.href = result.authorization_url
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to connect Google Calendar')
    }
  }

  const handleDisconnect = async (connectionId: number) => {
    if (!confirm('Are you sure you want to disconnect this calendar? All synced events will be removed.')) {
      return
    }
    
    try {
      await api.disconnectCalendar(connectionId)
      await loadCalendarConnections()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to disconnect calendar')
    }
  }

  const handleSync = async (connectionId?: number) => {
    setSyncLoading(connectionId || -1) // -1 means sync all
    try {
      const result = await api.syncCalendar(connectionId)
      await loadCalendarConnections()
      alert(`Sync completed! ${result.synced || 0} events synced.`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to sync calendar')
    } finally {
      setSyncLoading(null)
    }
  }

  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setUnsavedChanges(true)
  }

  const saveSettings = () => {
    // Here you would send preferences to backend if you store them there
    setUnsavedChanges(false)
    alert("Settings saved successfully!")
  }

  const resetSettings = () => {
    if (!confirm("Are you sure you want to reset all settings to default?")) return
    setPreferences({
      studyDuration: 25,
      breakDuration: 5,
      theme: "light",
      buddyName: "Buddy",
      buddyAppearance: "cat",
      voiceEnabled: true,
      notificationsEnabled: true,
      breakReminders: true,
      motivationalQuotes: true,
      soundEffects: true,
      autoStartBreaks: false,
    })
    setUnsavedChanges(true)
  }

  const exportData = () => {
    const allData = {
      user: user,
      tasks: JSON.parse(localStorage.getItem("smartBuddyTasks") || "[]"),
      moodHistory: JSON.parse(localStorage.getItem("smartBuddyMoodHistory") || "[]"),
      mindfulnessSessions: JSON.parse(localStorage.getItem("smartBuddyMindfulnessSessions") || "[]"),
    }
    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "smart-buddy-data.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (!confirm("Are you sure you want to delete all your data? This cannot be undone.")) return
    localStorage.removeItem("smartBuddyTasks")
    localStorage.removeItem("smartBuddyMoodHistory")
    localStorage.removeItem("smartBuddyMindfulnessSessions")
    localStorage.removeItem("smartBuddyTodayMood")
    alert("All data has been cleared.")
  }

  if (!user) {
    return <div>Loading...</div>
  }

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
                Settings
              </h1>
            </div>
            {unsavedChanges && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
                <Button onClick={saveSettings}>Save Changes</Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={user.username}
                    disabled
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buddy Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-xl">🤖</span>
                <span>Desktop Buddy</span>
              </CardTitle>
              <CardDescription>Customize your AI companion's appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buddyName">Buddy Name</Label>
                  <Input
                    id="buddyName"
                    value={preferences.buddyName}
                    onChange={(e) => updatePreference("buddyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buddyAppearance">Appearance</Label>
                  <Select
                    value={preferences.buddyAppearance}
                    onValueChange={(value) => updatePreference("buddyAppearance", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cat">🐱 Cat</SelectItem>
                      <SelectItem value="dog">🐶 Dog</SelectItem>
                      <SelectItem value="robot">🤖 Robot</SelectItem>
                      <SelectItem value="owl">🦉 Owl</SelectItem>
                      <SelectItem value="panda">🐼 Panda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Voice Interactions</Label>
                  <p className="text-sm text-gray-500">Enable voice responses from your buddy</p>
                </div>
                <Switch
                  checked={preferences.voiceEnabled}
                  onCheckedChange={(checked) => updatePreference("voiceEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Productivity Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-500" />
                <span>Productivity Settings</span>
              </CardTitle>
              <CardDescription>Configure your focus sessions and break intervals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Study Duration: {preferences.studyDuration} minutes</Label>
                  <Slider
                    value={[preferences.studyDuration]}
                    onValueChange={(value) => updatePreference("studyDuration", value[0])}
                    max={60}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">How long you want to focus before taking a break</p>
                </div>

                <div className="space-y-2">
                  <Label>Break Duration: {preferences.breakDuration} minutes</Label>
                  <Slider
                    value={[preferences.breakDuration]}
                    onValueChange={(value) => updatePreference("breakDuration", value[0])}
                    max={30}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">How long your breaks should last</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-start Breaks</Label>
                    <p className="text-sm text-gray-500">Automatically start break timer when focus session ends</p>
                  </div>
                  <Switch
                    checked={preferences.autoStartBreaks}
                    onCheckedChange={(checked) => updatePreference("autoStartBreaks", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Control when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Receive system notifications from the app</p>
                </div>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) => updatePreference("notificationsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Break Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded to take breaks during long work sessions</p>
                </div>
                <Switch
                  checked={preferences.breakReminders}
                  onCheckedChange={(checked) => updatePreference("breakReminders", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Motivational Quotes</Label>
                  <p className="text-sm text-gray-500">Receive daily motivational messages</p>
                </div>
                <Switch
                  checked={preferences.motivationalQuotes}
                  onCheckedChange={(checked) => updatePreference("motivationalQuotes", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-gray-500">Play sounds for notifications and timer alerts</p>
                </div>
                <Switch
                  checked={preferences.soundEffects}
                  onCheckedChange={(checked) => updatePreference("soundEffects", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Calendar Integration</span>
              </CardTitle>
              <CardDescription>Connect your external calendars to see events on your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {calendarLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading calendars...</span>
                </div>
              ) : (
                <>
                  {/* Connected Calendars */}
                  {calendarConnections.length > 0 && (
                    <div className="space-y-3">
                      <Label>Connected Calendars</Label>
                      {calendarConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {connection.provider === 'google' ? '📅' : connection.provider === 'outlook' ? '📆' : '🗓️'}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{connection.calendar_name}</p>
                                <p className="text-xs text-gray-500">
                                  {connection.provider_display}
                                  {connection.last_synced_at && (
                                    <> • Last synced: {new Date(connection.last_synced_at).toLocaleString()}</>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {connection.needs_refresh && (
                              <span className="text-xs text-orange-600">Needs refresh</span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(connection.id)}
                              disabled={syncLoading === connection.id}
                            >
                              {syncLoading === connection.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(connection.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Connect Buttons */}
                  <div className="space-y-2">
                    <Label>Connect Calendar</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        onClick={handleConnectGoogle}
                        variant="outline"
                        className="flex items-center justify-center space-x-2"
                        disabled={calendarLoading}
                      >
                        <span className="text-lg">📅</span>
                        <span>Google Calendar</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center justify-center space-x-2 opacity-50"
                      >
                        <span className="text-lg">📆</span>
                        <span>Outlook</span>
                        <span className="text-xs">(Coming Soon)</span>
                      </Button>
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center justify-center space-x-2 opacity-50"
                      >
                        <span className="text-lg">🗓️</span>
                        <span>Apple Calendar</span>
                        <span className="text-xs">(Coming Soon)</span>
                      </Button>
                    </div>
                  </div>

                  {/* Sync All Button */}
                  {calendarConnections.length > 0 && (
                    <div className="pt-2 border-t">
                      <Button
                        onClick={() => handleSync()}
                        variant="outline"
                        className="w-full"
                        disabled={syncLoading === -1}
                      >
                        {syncLoading === -1 ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync All Calendars
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {calendarConnections.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No calendars connected yet</p>
                      <p className="text-xs mt-1">Connect a calendar to see your events on the dashboard</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>Customize the look and feel of your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={preferences.theme} onValueChange={(value) => updatePreference("theme", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light Mode</SelectItem>
                    <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                    <SelectItem value="auto">🔄 Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>Export, backup, or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={exportData} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={resetSettings} variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Reset Settings
                </Button>
                <Button onClick={clearAllData} variant="destructive" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Export your data to backup your progress, reset settings to defaults, or permanently delete all stored
                information.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          {unsavedChanges && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-orange-800">Unsaved Changes</h3>
                    <p className="text-sm text-orange-600">You have unsaved changes. Don't forget to save!</p>
                  </div>
                  <Button onClick={saveSettings} className="bg-orange-600 hover:bg-orange-700">
                    Save All Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
