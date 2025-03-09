"use client"

import React, { useState, RefObject } from 'react'
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  onFileUpload, 
  fileInputRef 
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
      >
        <PaperClipIcon className="w-5 h-5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
          isLoading || !message.trim()
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
        }`}
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </form>
  )
} 