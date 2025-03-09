import React from 'react'
import { FormElement, FormElementType } from '@/types/form'
import { StarIcon } from '@heroicons/react/24/outline'

interface RenderFormElementProps {
  element: FormElement
  formValues: Record<string, string | string[] | boolean | number>
  handleInputChange: (id: string, value: string | string[] | boolean | number) => void
  handleOptionChange: (elementId: string, optionIndex: number, newValue: string) => void
}

export function renderFormElement({ element, formValues, handleInputChange, handleOptionChange }: RenderFormElementProps) {
  const mappedType = element.type
  const value = formValues[element.id]

  switch (mappedType) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'search':
    case 'password':
      return (
        <input
          type={mappedType}
          value={value as string || ''}
          onChange={(e) => handleInputChange(element.id, e.target.value)}
          placeholder={element.placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )

    case 'textarea':
      return (
        <textarea
          value={value as string || ''}
          onChange={(e) => handleInputChange(element.id, e.target.value)}
          placeholder={element.placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
        />
      )

    case 'select':
      return (
        <div>
          <select
            value={value as string || ''}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option</option>
            {(element.options || []).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="mt-2 space-y-2">
            {(element.options || []).map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(element.id, index, e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Option ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )

    case 'radio':
      return (
        <div className="space-y-2">
          {(element.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name={element.id}
                value={option}
                checked={value === option}
                onChange={(e) => handleInputChange(element.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(element.id, index, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )

    case 'checkbox':
      return (
        <div className="space-y-2">
          {(element.options || []).map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                checked={(value as string[] || []).includes(option)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...(value as string[] || []), option]
                    : (value as string[] || []).filter(v => v !== option)
                  handleInputChange(element.id, newValues)
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 ml-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(element.id, index, e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )

    case 'date':
    case 'time':
    case 'datetime-local':
    case 'month':
    case 'week':
      return (
        <input
          type={mappedType}
          value={value as string || ''}
          onChange={(e) => handleInputChange(element.id, e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )

    case 'number':
      return (
        <input
          type="number"
          value={value as string || ''}
          onChange={(e) => handleInputChange(element.id, e.target.value)}
          min={element.min}
          max={element.max}
          step={element.step}
          placeholder={element.placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )

    case 'range':
      return (
        <div>
          <input
            type="range"
            value={value as string || '0'}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            min={element.min || 0}
            max={element.max || 100}
            step={element.step || 1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{element.min || 0}</span>
            <span>{element.max || 100}</span>
          </div>
        </div>
      )

    case 'color':
      return (
        <input
          type="color"
          value={value as string || '#000000'}
          onChange={(e) => handleInputChange(element.id, e.target.value)}
          className="w-12 h-12 p-1 border border-gray-300 rounded"
        />
      )

    case 'file':
      return (
        <input
          type="file"
          onChange={(e) => {
            const files = e.target.files
            if (files && files.length > 0) {
              handleInputChange(element.id, files[0].name)
            }
          }}
          accept={element.accept}
          multiple={element.multiple}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      )

    case 'hidden':
      return (
        <input
          type="hidden"
          value={value as string || element.defaultValue || ''}
          name={element.id}
        />
      )

    case 'rating':
      return (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleInputChange(element.id, star)}
              className="focus:outline-none"
            >
              <StarIcon
                className={`h-8 w-8 ${
                  (value as number) >= star ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      )

    default:
      return (
        <input
          type="text"
          value={value as string || ''}
          onChange={(e) => handleInputChange(element.id, e.target.value)}
          placeholder={element.placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )
  }
} 