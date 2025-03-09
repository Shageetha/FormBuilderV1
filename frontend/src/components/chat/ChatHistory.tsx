import { Message } from '@/types/chat'
import ChatMessage from './ChatMessage'

interface ChatHistoryProps {
  messages: Message[]
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
        />
      ))}
    </div>
  )
} 