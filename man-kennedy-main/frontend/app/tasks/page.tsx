"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, CheckSquare, Clock, Trash2, Edit } from "lucide-react"
import Link from "next/link"

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
  priority: "low" | "medium" | "high"
  category: string
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  useEffect(() => {
    const savedTasks = localStorage.getItem("smartBuddyTasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    localStorage.setItem("smartBuddyTasks", JSON.stringify(updatedTasks))
  }

  const addTask = () => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority: "medium",
      category: "General",
    }

    saveTasks([...tasks, task])
    setNewTask("")
  }

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    saveTasks(updatedTasks)
  }

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    saveTasks(updatedTasks)
  }

  const startEditing = (task: Task) => {
    setEditingTask(task.id)
    setEditTitle(task.title)
  }

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return

    const updatedTasks = tasks.map((task) => (task.id === id ? { ...task, title: editTitle.trim() } : task))
    saveTasks(updatedTasks)
    setEditingTask(null)
    setEditTitle("")
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditTitle("")
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.filter((task) => !task.completed).length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
              Task Manager
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Task Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  <span>Task Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{completedCount}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                {tasks.length > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((completedCount / tasks.length) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filter Options */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className="w-full justify-start"
                >
                  All Tasks ({tasks.length})
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  onClick={() => setFilter("pending")}
                  className="w-full justify-start"
                >
                  Pending ({pendingCount})
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  onClick={() => setFilter("completed")}
                  className="w-full justify-start"
                >
                  Completed ({completedCount})
                </Button>
              </CardContent>
            </Card>

            {/* Productivity Tips */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800">💡 Productivity Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-purple-700">
                  <p>• Break large tasks into smaller ones</p>
                  <p>• Use the Pomodoro Technique for focus</p>
                  <p>• Prioritize tasks by importance</p>
                  <p>• Set realistic daily goals</p>
                  <p>• Celebrate completed tasks!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Task List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add New Task */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-500" />
                  <span>Add New Task</span>
                </CardTitle>
                <CardDescription>What would you like to accomplish today?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    className="flex-1"
                  />
                  <Button onClick={addTask} disabled={!newTask.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Tasks</span>
                  <Badge variant="outline">
                    {filteredTasks.length} {filter === "all" ? "total" : filter}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-2">
                        {filter === "all"
                          ? "No tasks yet. Add your first task above!"
                          : filter === "pending"
                            ? "No pending tasks. Great job!"
                            : "No completed tasks yet. Keep going!"}
                      </p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                          task.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />

                        <div className="flex-1 min-w-0">
                          {editingTask === task.id ? (
                            <div className="flex space-x-2">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") saveEdit(task.id)
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => saveEdit(task.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(task.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {editingTask !== task.id && (
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => startEditing(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedTasks = tasks.map((task) => ({ ...task, completed: true }))
                        saveTasks(updatedTasks)
                      }}
                    >
                      Mark All Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedTasks = tasks.filter((task) => !task.completed)
                        saveTasks(updatedTasks)
                      }}
                    >
                      Clear Completed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete all tasks?")) {
                          saveTasks([])
                        }
                      }}
                    >
                      Clear All Tasks
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
