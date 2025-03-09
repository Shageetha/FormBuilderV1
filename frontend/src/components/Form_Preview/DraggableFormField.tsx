import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { FormElement, FormAction, FormElementType } from '@/types/form'
import { EllipsisVerticalIcon, Bars3Icon, TrashIcon, Cog6ToothIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { FieldControls } from '../forms/FieldControls'
import { FieldTypeSelector } from '../forms/FieldTypeSelector'

interface DraggableFormFieldProps {
  element: FormElement;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  elements: FormElement[];
  onAddField: (action: FormAction) => void;
  onSettingsClick: (elementId: string) => void;
  onSwapField: (fieldId: string, newType: FormElementType) => void;
  renderFormElement: (element: FormElement) => React.ReactNode;
}

interface DragItem {
  id: string
  type: string
  index?: number
  isNew?: boolean
  placeholder?: string
}

export function DraggableFormField({ 
  element, 
  index, 
  moveField, 
  elements, 
  onAddField,
  onSettingsClick,
  onSwapField,
  renderFormElement 
}: DraggableFormFieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [showTypeSelector, setShowTypeSelector] = React.useState(false)
  const [selectorPosition, setSelectorPosition] = React.useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = React.useState(false)
  const [startWidth, setStartWidth] = React.useState(0)
  const [startX, setStartX] = React.useState(0)
  const [width, setWidth] = React.useState(element.width || '100%')
  
  const [{ isDragging }, drag] = useDrag({
    type: 'FORM_FIELD',
    item: { id: element.id, type: 'FORM_FIELD', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ handlerId }, drop] = useDrop({
    accept: 'FORM_FIELD',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex! < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex! > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveField(dragIndex!, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartWidth(ref.current?.offsetWidth || 0)
    setStartX(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && ref.current) {
        const diff = e.clientX - startX
        const newWidth = startWidth + diff
        const containerWidth = ref.current.parentElement?.offsetWidth || 1
        const percentage = Math.min(100, Math.max(25, (newWidth / containerWidth) * 100))
        setWidth(`${percentage}%`)
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      // Update the element width in the parent component
      const updatedElements = elements.map(el => {
        if (el.id === element.id) {
          return { ...el, width }
        }
        return el
      })
      onAddField({ type: 'UPDATE', elements: updatedElements })
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSettingsClick(element.id)
  }

  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedElements = elements.filter(field => field.id !== element.id)
    onAddField({ type: 'UPDATE', elements: updatedElements })
  }

  const handleDuplicateField = (fieldId: string) => {
    const fieldToDuplicate = elements.find(field => field.id === fieldId)
    if (fieldToDuplicate) {
      const newField = {
        ...fieldToDuplicate,
        id: `${fieldToDuplicate.type}_${Date.now()}`,
        label: `${fieldToDuplicate.label} (Copy)`
      }
      const insertIndex = elements.findIndex(field => field.id === fieldId) + 1
      const updatedElements = [...elements]
      updatedElements.splice(insertIndex, 0, newField)
      onAddField({ type: 'UPDATE', elements: updatedElements })
    }
  }

  const handleSwapField = (fieldId: string, newType: FormElementType) => {
    onSwapField(fieldId, newType)
    setShowTypeSelector(false)
  }

  const getFieldSizeClass = (size?: 'normal' | 'large' | 'small') => {
    switch (size) {
      case 'large':
        return 'py-4'
      case 'small':
        return 'py-2'
      default:
        return 'py-3'
    }
  }

  const handleResize = (fieldId: string, newWidth: number) => {
    const updatedElements = elements.map(el => {
      if (el.id === fieldId) {
        return {
          ...el,
          width: `${newWidth}%`
        }
      }
      return el
    })
    onAddField({ type: 'UPDATE', elements: updatedElements })
  }

  drag(drop(ref))

  return (
    <div 
      ref={ref}
      style={{ width: element.width || '100%' }}
      className={`relative group ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      data-handler-id={handlerId}
    >
      <div className="relative border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <input
              type="text"
              value={element.label}
              onChange={(e) => {
                const updatedElements = elements.map(el => {
                  if (el.id === element.id) {
                    return { ...el, label: e.target.value }
                  }
                  return el
                })
                onAddField({ type: 'UPDATE', elements: updatedElements })
              }}
              className="font-medium text-gray-900 w-full bg-transparent border-0 focus:ring-0 focus:outline-none hover:bg-gray-50 p-1 rounded"
              placeholder="Field Label"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                setShowTypeSelector(true)
                if (ref.current) {
                  const rect = ref.current.getBoundingClientRect()
                  setSelectorPosition({ x: rect.left, y: rect.top + rect.height })
                }
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className={`${getFieldSizeClass(element.size)}`}>
          {renderFormElement(element)}
        </div>
        
        <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 text-gray-400 hover:text-gray-600 cursor-move">
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100" 
          onMouseDown={handleResizeStart}
        />
        
        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleSettingsClick}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={() => handleDuplicateField(element.id)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Duplicate"
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={handleDeleteField}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Delete"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {showTypeSelector && (
        <FieldTypeSelector
          isOpen={showTypeSelector}
          onClose={() => setShowTypeSelector(false)}
          onSelect={(type) => handleSwapField(element.id, type)}
          currentType={element.type}
          position={selectorPosition}
        />
      )}
    </div>
  )
} 