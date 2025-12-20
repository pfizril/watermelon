"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, ArrowLeft, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { api, ChatMessage } from "@/lib/api"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    loadChatMessages()
  }, [user, router])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const loadChatMessages = async () => {
    try {
      const chatMessages = await api.getChatMessages()
      const formattedMessages: Message[] = chatMessages.map((msg: ChatMessage) => ({
        id: msg.id.toString(),
        content: msg.content,
        isBot: msg.role === 'assistant',
        timestamp: new Date(msg.created_at)
      })).reverse() // Reverse to show oldest first

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Failed to load chat messages:', error)
      // Start with a welcome message if no messages exist
      setMessages([{
        id: '1',
        content: "Hello! I'm your AI assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date()
      }])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await api.sendChatMessage(userMessage.content)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isBot: true,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-900">AI Chatbot</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome, {user.username}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[80vh]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-500" />
              <span>AI Chatbot</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Bot className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-gray-500">Loading conversation...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isBot
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.isBot ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[70%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="flex space-x-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading || isLoadingMessages}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isLoadingMessages}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}