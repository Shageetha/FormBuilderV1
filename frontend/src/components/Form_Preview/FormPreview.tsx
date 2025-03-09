import React, { useState, useRef, useCallback, useEffect } from 'react'
import { FormElement, FormAction, FormElementType } from '@/types/form'
import { useDrop } from 'react-dnd'
import { StarIcon } from '@heroicons/react/24/outline'
import { useForm } from '../Form_Preview/FormContext'
import { DraggableFormField } from './DraggableFormField'
import { renderFormElement as renderFormElementComponent } from './FormRenderComponents'
import { 
  getThemeStyles, 
  getFieldStyles, 
  getButtonStyles, 
  getFieldIcon, 
  formatTimeValue,
  scrollbarStyles,
  renderFormElementHTML
} from './FormPreviewUtils'

interface FormPreviewProps {
  elements: FormElement[]
  onAddField: (action: FormAction) => void
  onSettingsClick: (elementId: string) => void
  onDeleteField: (fieldId: string) => void
  onLabelChange: (fieldId: string, newLabel: string) => void
  onSwapField: (fieldId: string, newType: FormElementType) => void
}

// Add this interface for form values
interface FormValues {
  [key: string]: string | string[] | boolean | number
}

export function FormPreview({ elements, onAddField, onSettingsClick, onDeleteField, onLabelChange, onSwapField }: FormPreviewProps) {
  const { formTheme, formName, setFormName } = useForm()
  const dropRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [formValues, setFormValues] = useState<FormValues>({})
  const [editingField, setEditingField] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const fieldsPerPage = 4
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 })
  const formRef = useRef<HTMLDivElement>(null)
  const [showFieldNav, setShowFieldNav] = useState(true)

  // Add drop functionality
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ['FORM_ELEMENT', 'FORM_FIELD'],
    drop: (item: any, monitor) => {
      if (monitor.getItemType() === 'FORM_ELEMENT') {
        // Handle dropping a new element from the sidebar
        const newField: FormElement = {
          id: `${item.type}_${Date.now()}`,
          type: item.type as FormElementType,
          label: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Field`,
          placeholder: item.placeholder || '',
          options: ['multiple-choice', 'dropdown', 'checkbox', 'radio', 'select'].includes(item.type) 
            ? ['Option 1', 'Option 2', 'Option 3'] 
            : undefined,
          required: false
        }
        onAddField({ type: 'ADD', element: newField })
      }
      return { name: 'FormPreview' }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const isActive = canDrop && isOver
  drop(dropRef)

  useEffect(() => {
    const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollProgress(progress)
      setIsScrolling(true)
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(handleScrollEnd, 200)
      }
    }

    let scrollTimeout: NodeJS.Timeout
    const handleScrollEnd = () => {
        setIsScrolling(false)
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Add handler for form value changes
  const handleInputChange = (id: string, value: string | string[] | boolean | number) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    const updatedElements = [...elements]
    const draggedField = updatedElements[dragIndex]
    updatedElements.splice(dragIndex, 1)
    updatedElements.splice(hoverIndex, 0, draggedField)
    onAddField({ type: 'UPDATE', elements: updatedElements })
  }, [elements, onAddField])

  const handleFieldTypeChange = (fieldId: string, newType: FormElementType) => {
    console.log('Field type change requested:', { fieldId, newType })
    onSwapField(fieldId, newType)
  }

  const handleResize = (fieldId: string, size: 'normal' | 'large' | 'small') => {
    const updatedElements = elements.map(el => {
      if (el.id === fieldId) {
        return {
          ...el,
          size
        }
      }
      return el
    })
    onAddField({ type: 'UPDATE', elements: updatedElements })
  }

  const handleOptionChange = (elementId: string, optionIndex: number, newValue: string) => {
    const updatedElements = elements.map(el => {
      if (el.id === elementId && el.options) {
        const newOptions = [...el.options];
        newOptions[optionIndex] = newValue;
        return { ...el, options: newOptions };
      }
      return el;
    });
    onAddField({ type: 'UPDATE', elements: updatedElements });
  };

  if (elements.length === 0) {
    return (
      <div className="w-full h-full p-8 bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your form is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding form fields from the left panel, or use AI to generate a form automatically.
          </p>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            onClick={() => {/* Add AI form generation trigger here */}}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2C5.59 2 2 5.59 2 10s3.59 8 8 8 8-3.59 8-8S14.41 2 10 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12.5 7H11v6h1.5z" />
            </svg>
            Generate with AI
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with values:', formValues)
    // Here you would typically send the form data to your backend
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, Math.ceil(elements.length / fieldsPerPage) - 1))
  }

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0))
  }

  function renderFormElement(element: FormElement) {
    return renderFormElementComponent({
      element,
      formValues,
      handleInputChange,
      handleOptionChange
    })
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
        <div className="flex h-full">
          {/* Field Navigation Sidebar */}
          {showFieldNav && (
          <div className="w-56 bg-white border-r border-gray-200 shadow-sm flex-shrink-0 flex flex-col h-full">
              <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Form Fields</h3>
                <button 
                  onClick={() => setShowFieldNav(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-2 space-y-2">
                    {elements.map((element, index) => (
                  <div 
                        key={element.id}
                    className={`p-2 border rounded-md cursor-pointer ${
                      activeFieldId === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveFieldId(element.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2 flex-shrink-0">
                          {getFieldIcon(element.type)}
                        </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {element.label || 'Untitled Field'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
                        </p>
                      </div>
                        </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Bar */}
          <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0">
            {!showFieldNav && (
              <button
                onClick={() => setShowFieldNav(true)}
                className="inline-flex items-center px-2 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Show Fields
              </button>
            )}
          </div>
          
          {/* Form Container */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="p-4">
            <div 
              ref={formRef} 
                className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm"
                style={getThemeStyles(formTheme)}
            >
              {/* Form header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      value={formName || ''}
                      onChange={(e) => {
                        setFormName(e.target.value);
                      }}
                      placeholder="Enter form title"
                      className="text-lg font-semibold text-gray-900 w-full bg-transparent border-0 focus:ring-0 focus:outline-none hover:bg-gray-50 p-1 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        // Generate HTML content with styling and form elements
                        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formName || 'Untitled Form'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${scrollbarStyles}
        .custom-form-container {
            max-width: 42rem;
            margin: 2rem auto;
            background: ${formTheme?.backgroundColor || 'white'};
            border-radius: ${formTheme?.borderRadius || '0.5rem'};
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .form-field {
            margin-bottom: 1.5rem;
        }
        .form-field:hover {
            border-color: #d1d5db;
        }
        .form-label {
            display: block;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: ${formTheme?.textColor || '#111827'};
        }
        .form-input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            margin-top: 0.25rem;
        }
        .form-input:focus {
            outline: 2px solid ${formTheme?.primaryColor || '#3b82f6'};
            outline-offset: 2px;
        }
        .required {
            color: #ef4444;
            margin-left: 0.25rem;
        }
        .submit-button {
            background-color: ${formTheme?.primaryColor || '#3b82f6'};
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 500;
            width: 100%;
            margin-top: 1.5rem;
        }
        .submit-button:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen py-8">
    <div class="custom-form-container">
        <h1 class="text-2xl font-bold mb-6 text-center" style="color: ${formTheme?.textColor || '#111827'}">
            ${formName || 'Untitled Form'}
        </h1>
        <form>
            ${elements.map(element => renderFormElementHTML(element, formTheme)).join('\n')}
            <button type="submit" class="submit-button">
                Submit
            </button>
        </form>
    </div>
</body>
</html>
`
                          // Create a blob and download it
                          const blob = new Blob([htmlContent], { type: 'text/html' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `${formName || 'form'}.html`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                      Deploy Form
                    </button>
                  </div>
                </div>
              </div>

                {/* Form content */}
                <div 
                  ref={dropRef}
                  className={`p-4 min-h-[300px] ${isActive ? 'bg-blue-50' : 'bg-white'}`}
                >
                  {elements.length > 0 && (
                  <div className="space-y-4">
                    {elements.map((element, index) => (
                      <div
                        key={element.id}
                        id={element.id}
                        className={`relative border ${
                          activeFieldId === element.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } rounded-lg transition-all`}
                          style={getFieldStyles(activeFieldId === element.id, formTheme)}
                        onClick={() => setActiveFieldId(element.id)}
                      >
                        <DraggableFormField
                          element={element}
                          index={index}
                          moveField={moveField}
                          elements={elements}
                          onAddField={onAddField}
                          onSettingsClick={onSettingsClick}
                          onSwapField={onSwapField}
                          renderFormElement={renderFormElement}
                        />
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 