"use client"

import React, { useState, useEffect, useRef, MutableRefObject } from 'react'
import ChatInput from './ChatInput'
import ChatHistory from './ChatHistory'
import { Message } from '@/types/chat'
import { PaperClipIcon } from '@heroicons/react/24/solid'
import { saveForm, updateForm } from '../forms/FormSaver'
import { useToast } from '@/components/ui/Toast'
import { FormElement } from '@/types/form'
import { v4 as uuidv4 } from 'uuid'
import { FormPreview } from '../Form_Preview/FormPreview'
import { useForm } from '@/components/Form_Preview/FormContext'
import { useUser } from '@/contexts/UserContext'
import { AIChatFormHandler } from './AIChatFormHandler'

interface AIChatPanelProps {
  onResponse?: (response: string) => void
}

export default function AIChatPanel({ onResponse }: AIChatPanelProps) {
  const { formElements, setFormElements, formName, setFormName, isReady } = useForm()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUser()
  const userId = user?.id || 1
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null) as MutableRefObject<HTMLInputElement>
  const { showToast } = useToast()
  const [formId, setFormId] = useState<number | null>(null)
  
  // Create form handler instance once
  const formHandler = useRef(new AIChatFormHandler()).current

  useEffect(() => {
    if (isReady && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isReady])

  // Load saved form ID from session storage
  useEffect(() => {
    if (isReady) {
      try {
        const savedFormId = sessionStorage.getItem('currentFormId')
        if (savedFormId) setFormId(Number(savedFormId))
      } catch (error) {
        console.error('Error loading saved form ID:', error)
      }
    }
  }, [isReady])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleSendMessage(`I want to create a form based on this ${file.name} file`)
    }
  }
 
  const handleFormCreation = async (newFormName: string, fields: FormElement[]) => {
    if (!isReady) return // Prevent execution until context is ready

    try {
      const existingFormId = sessionStorage.getItem('currentFormId')
      const currentTime = new Date().toISOString()
      const validFormName = newFormName?.trim() || 'Untitled Form'

      if (existingFormId) {
        const updateData = {
          form_id: Number(existingFormId),
          form_name: validFormName,
          fields: fields,
          user_id: userId,
          updated_at: currentTime
        }

        console.log('Updating form with data:', updateData)
        const response = await updateForm(updateData)
        setFormName(response.form_name || validFormName)
        
        showToast({
          title: 'Form updated',
          description: 'Your form has been updated successfully',
          type: 'success',
        })
      } else {
        const response = await saveForm(validFormName, fields, userId)
        setFormId(response.form_id)
        setFormName(response.form_name || validFormName)

        sessionStorage.setItem('currentFormId', response.form_id.toString())

        showToast({
          title: 'Form saved',
          description: 'Your form has been automatically saved',
          type: 'success',
        })
      }
    } catch (error) {
      console.error('Error saving or updating form:', error)
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was an error processing the form.',
        type: 'error',
      })
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isReady) return

    try {
      setIsLoading(true)
      
      const userMessage: Message = {
        id: uuidv4(),
        content,
        role: 'user',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      const responseMessage = await formHandler.handleFormRequest(
        content,
        formElements || [],
        async (action) => {
          if (action.type === 'UPDATE' && action.elements) {
            setFormElements(action.elements)
            
            if (action.formName) {
              await handleFormCreation(
                action.formName,
                action.elements
              )
            }
          }
        }
      )

      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: responseMessage,
        role: 'assistant',
        timestamp: new Date()
      }])

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date()
      }])
      
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If context is not ready, show loading state
  if (!isReady) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">AI Form Assistant</h2>
          <p className="text-sm text-gray-500 mt-1">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white/80 backdrop-blur-sm px-6 py-4 border-b border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Form Assistant
        </h2>
        <p className="text-sm text-gray-500 mt-1">Create forms with AI assistance</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center transform transition-all hover:scale-110">
              <PaperClipIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Start Creating</h3>
              <p className="text-sm text-gray-500 mt-1">
                Describe your form requirements or upload a file
              </p>
            </div>
          </div>
        ) : (
          <ChatHistory messages={messages} />
        )}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 p-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          onFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  )
}