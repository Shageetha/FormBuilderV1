import { createPortal } from 'react-dom'
import React, { useEffect, useRef } from 'react'
import { basicFields, dateTimeFields, choiceFields, ratingFields } from './fieldConfigs'
import { FormElementType } from '@/types/form'

interface FieldTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: FormElementType) => void
  currentType: FormElementType
  position: { top: number, left: number }
}

export function FieldTypeSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentType,
  position
}: FieldTypeSelectorProps) {
  if (!isOpen) return null

  const selectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getRelevantFields = () => {
    const allFields = [
      ...basicFields,
      ...choiceFields,
      ...dateTimeFields,
      ...ratingFields
    ]
    console.log('🔄 FieldTypeSelector: Available fields:', allFields)
    return allFields
  }

  const relevantFields = getRelevantFields()

  const handleTypeSelect = (newType: FormElementType) => {
    console.log('🔄 FieldTypeSelector: handleTypeSelect', {
      newType,
      currentType,
    })
    
    if (newType === currentType) {
      console.log('🔄 FieldTypeSelector: Same type selected, closing')
      onClose()
      return
    }
    
    try {
      console.log('🔄 FieldTypeSelector: Calling onSelect with:', newType)
      onSelect(newType)
      onClose()
    } catch (error) {
      console.error('🔄 FieldTypeSelector: Error in handleTypeSelect:', error)
    }
  }

  return (
    <div 
      ref={selectorRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200"
      style={{ 
        width: '280px',
        maxHeight: '400px',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999
      }}
      onClick={(e) => {
        console.log('🎯 Selector container clicked')
      }}
    >
      <div className="p-3">
        <div className="text-xs text-gray-600 mb-2">
          Select new field type:
        </div>
        <div 
          className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[350px]"
          onClick={(e) => {
            console.log('🎯 Grid container clicked')
          }}
        >
          {relevantFields.map((field) => (
            <button
              key={field.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🎯 Button mousedown:', field.id)
              }}
              onMouseUp={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🎯 Button mouseup:', field.id)
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🎯 Button clicked:', field.id)
                handleTypeSelect(field.id as FormElementType)
              }}
              className="flex flex-col items-center justify-center gap-1 p-2 text-sm rounded border transition-all duration-200 cursor-pointer"
            >
              <field.icon className="w-6 h-6" />
              <span className="truncate text-xs font-medium">{field.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
