import { format } from 'date-fns'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
      {role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
          <span className="text-white text-xs font-medium">AI</span>
        </div>
      )}
      
      <div className={`
        max-w-[80%] p-4 rounded-2xl transition-all duration-200
        ${role === 'user'
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg'
          : 'bg-white text-gray-800 rounded-bl-none shadow-md hover:shadow-lg border border-gray-100'
        }
        hover:-translate-y-0.5
      `}>
        <div className={`
          text-sm
          ${content.includes('\n') ? 'whitespace-pre-wrap' : ''}
        `}>
          {content.split('\n').map((line, i) => (
            <div
              key={i}
              className={`
                ${line.startsWith('📝') ? 'font-medium' : ''}
                ${i > 0 ? 'mt-2' : ''}
                ${line.startsWith('📝') ? 'flex items-center gap-2' : ''}
              `}
            >
              {line}
            </div>
          ))}
        </div>
        {timestamp && (
          <div className={`
            text-[10px] mt-2 flex items-center gap-1
            ${role === 'user' ? 'text-blue-100' : 'text-gray-400'}
          `}>
            <div className="w-1 h-1 rounded-full bg-current"></div>
            {format(timestamp, 'HH:mm')}
          </div>
        )}
      </div>

      {role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
          <span className="text-white text-xs font-medium">You</span>
        </div>
      )}
    </div>
  )
} 