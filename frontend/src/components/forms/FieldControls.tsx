import React, { useState, useRef, useCallback } from 'react'
import { FormElement, FormElementType } from '@/types/form'
import { 
  ArrowsUpDownIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'
import { FieldTypeSelector } from './FieldTypeSelector'
import { createPortal } from 'react-dom'
import * as Tooltip from '@radix-ui/react-tooltip'

interface FieldControlsProps {
  element: FormElement
  onSettingsClick: (id: string) => void
  onDeleteField: (id: string) => void
  onDuplicateField: (id: string) => void
  onSwapField: (id: string, newType: FormElementType) => void
  onResize?: (id: string, width: number) => void
}

export function FieldControls({ 
  element, 
  onSettingsClick, 
  onDeleteField,
  onDuplicateField,
  onSwapField,
  onResize 
}: FieldControlsProps) {
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const initialWidthRef = useRef<number>(0)
  const initialXRef = useRef<number>(0)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    initialXRef.current = e.clientX
    const fieldElement = resizeRef.current?.parentElement
    initialWidthRef.current = fieldElement?.offsetWidth || 0
    
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return
      const deltaX = e.clientX - initialXRef.current
      const newWidth = Math.max(300, initialWidthRef.current + deltaX) // minimum width of 300px
      onResize?.(element.id, newWidth)
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }, [element.id, isResizing, onResize])

  const handleSwapClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('🔄 FieldControls: handleSwapClick', {
      elementId: element.id,
      currentType: element.type
    })
    
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const topPosition = rect.top + window.scrollY
      setPosition({
        top: topPosition,
        left: rect.left - 228
      })
    }
    setShowTypeSelector(prev => !prev)
  }

  const handleSwapField = (fieldId: string, newType: FormElementType) => {
    console.log('🔄 FieldControls: handleSwapField called', { fieldId, newType })
    onSwapField(fieldId, newType)
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="absolute -top-3 left-0 right-12 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-1 flex items-center gap-1">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button 
                ref={buttonRef}
                onClick={handleSwapClick}
                className="p-1.5 rounded-md transition-colors hover:bg-gray-50 text-gray-600"
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                sideOffset={5}
              >
                Change type
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <div className="w-[1px] h-4 bg-gray-200" />

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button 
                onClick={() => onSettingsClick(element.id)}
                className="p-1.5 rounded-md transition-colors hover:bg-gray-50 text-gray-600"
              >
                <Cog6ToothIcon className="w-4 h-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                sideOffset={5}
              >
                Settings
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button 
                onClick={() => onDuplicateField(element.id)}
                className="p-1.5 rounded-md transition-colors hover:bg-gray-50 text-gray-600"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                sideOffset={5}
              >
                Duplicate
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <div className="w-[1px] h-4 bg-gray-200" />

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button 
                onClick={() => onDeleteField(element.id)}
                className="p-1.5 rounded-md transition-colors hover:bg-red-50 text-red-500"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                sideOffset={5}
              >
                Delete
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>

      <div
        ref={resizeRef}
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity
          ${isResizing ? 'bg-blue-500' : 'bg-gray-300 hover:bg-blue-500'}`}
        onMouseDown={handleResizeStart}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 rounded-full bg-current" />
      </div>

      {showTypeSelector && (
        <Portal>
          <FieldTypeSelector
            isOpen={showTypeSelector}
            onClose={() => setShowTypeSelector(false)}
            onSelect={(newType) => {
              handleSwapField(element.id, newType)
              setShowTypeSelector(false)
            }}
            currentType={element.type}
            position={position}
          />
        </Portal>
      )}
    </Tooltip.Provider>
  )
}

function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body)
} 