import React from 'react'
import { FormElement, FormElementType } from '@/types/form'
import { FormTheme } from '@/components/Left Panel/ThemePanel'

// Custom scrollbar styles
export const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E0 #F3F4F6;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #F3F4F6;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 3px;
    border: 2px solid transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #A0AEC0;
  }
`

/**
 * Function to add custom scrollbar styles to the document head.
 */
export function applyScrollbarStyles() {
  if (typeof document !== 'undefined') {
    // Avoid adding the styles multiple times by checking for an existing element
    if (!document.getElementById('custom-scrollbar-styles')) {
      const style = document.createElement('style')
      style.id = 'custom-scrollbar-styles'
      style.textContent = scrollbarStyles
      document.head.appendChild(style)
    }
  }
}

// Call the function immediately to apply scrollbar styles
applyScrollbarStyles()

export const getThemeStyles = (formTheme: FormTheme | null) => {
  return {
    backgroundColor: formTheme?.backgroundColor || 'white',
    color: formTheme?.textColor || '#111827',
    fontFamily: formTheme?.fontFamily || 'Inter, sans-serif',
    borderRadius: formTheme?.borderRadius || '0.5rem',
    boxShadow: formTheme?.style === 'shadow'
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      : 'none',
    borderWidth: formTheme?.style === 'outline' ? '2px' : '1px',
    borderColor: formTheme?.style === 'outline' ? formTheme?.primaryColor || '#3b82f6' : '#e5e7eb',
    padding: formTheme?.layout === 'compact'
      ? '0.75rem'
      : formTheme?.layout === 'spacious'
      ? '2rem'
      : '1.5rem'
  }
}

export const getFieldStyles = (isActive: boolean, formTheme: FormTheme | null) => {
  return {
    borderColor: isActive ? formTheme?.primaryColor || '#3b82f6' : undefined,
    backgroundColor: isActive ? `${formTheme?.primaryColor}10` || '#3b82f610' : undefined,
  }
}

export const getButtonStyles = (formTheme: FormTheme | null) => {
  return {
    backgroundColor: formTheme?.primaryColor || '#3b82f6',
    borderRadius: formTheme?.borderRadius || '0.375rem'
  }
}

export const getFieldIcon = (type: FormElementType) => {
  switch (type) {
    case 'text':
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    // ... (other cases remain unchanged)
    default:
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      )
  }
}

export function formatTimeValue(timeValue: string, meridiem: string): string {
  if (!timeValue) return ''
  
  const [hours, minutes] = timeValue.split(':')
  const hoursNum = parseInt(hours, 10)
  
  if (meridiem === 'PM' && hoursNum < 12) {
    return `${hoursNum + 12}:${minutes}`
  } else if (meridiem === 'AM' && hoursNum === 12) {
    return `00:${minutes}`
  }
  
  return timeValue
}

export function renderFormElementHTML(element: FormElement, formTheme: FormTheme | null) {
  const mappedType = element.type
  
  switch (mappedType) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'search':
    case 'password':
    case 'number':
      return `
        <div class="form-field">
          <label class="form-label">
            ${element.label}${element.required ? '<span class="required">*</span>' : ''}
          </label>
          <input 
            type="${mappedType}" 
            name="${element.id}" 
            placeholder="${element.placeholder || ''}" 
            class="form-input"
            ${element.required ? 'required' : ''}
          />
          ${element.caption ? `<p class="text-sm text-gray-500 mt-1">${element.caption}</p>` : ''}
        </div>
      `
    // ... (rest of renderFormElementHTML function remains unchanged)
    default:
      return `
        <div class="form-field">
          <label class="form-label">
            ${element.label}${element.required ? '<span class="required">*</span>' : ''}
          </label>
          <input 
            type="text" 
            name="${element.id}" 
            placeholder="${element.placeholder || ''}" 
            class="form-input"
            ${element.required ? 'required' : ''}
          />
          ${element.caption ? `<p class="text-sm text-gray-500 mt-1">${element.caption}</p>` : ''}
        </div>
      `
  }
}
