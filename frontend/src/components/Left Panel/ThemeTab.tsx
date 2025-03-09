import React, { useState } from 'react'
import { useForm } from '@/components/Form_Preview/FormContext'
import styles from './TabStyles.module.css'
import { saveFormToSessionStorage } from '@/utils/sessionStorage'

interface ThemePanelProps {
  onThemeChange?: (theme: FormTheme) => void;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  layout: 'default' | 'compact' | 'spacious';
  style: 'flat' | 'shadow' | 'outline';
}

const defaultThemes = [
  {
    name: 'Default',
    theme: {
      primaryColor: '#3B82F6', // blue-500
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937', // gray-800
      borderRadius: '0.375rem', // rounded-md
      fontFamily: 'Inter, sans-serif',
      layout: 'default' as const,
      style: 'flat' as const
    }
  },
  {
    name: 'Modern',
    theme: {
      primaryColor: '#8B5CF6', // violet-500
      backgroundColor: '#F9FAFB', // gray-50
      textColor: '#111827', // gray-900
      borderRadius: '0.5rem', // rounded-lg
      fontFamily: 'Poppins, sans-serif',
      layout: 'spacious' as const,
      style: 'shadow' as const
    }
  },
  {
    name: 'Minimal',
    theme: {
      primaryColor: '#10B981', // emerald-500
      backgroundColor: '#FFFFFF',
      textColor: '#374151', // gray-700
      borderRadius: '0.25rem', // rounded
      fontFamily: 'Inter, sans-serif',
      layout: 'compact' as const,
      style: 'outline' as const
    }
  },
  {
    name: 'Dark',
    theme: {
      primaryColor: '#60A5FA', // blue-400
      backgroundColor: '#1F2937', // gray-800
      textColor: '#F9FAFB', // gray-50
      borderRadius: '0.375rem', // rounded-md
      fontFamily: 'Inter, sans-serif',
      layout: 'default' as const,
      style: 'flat' as const
    }
  },
  {
    name: 'Sunshine',
    theme: {
      primaryColor: '#F59E0B', // amber-500 (yellow)
      backgroundColor: '#FFFBEB', // amber-50
      textColor: '#78350F', // amber-900
      borderRadius: '0.5rem', // rounded-lg
      fontFamily: 'Poppins, sans-serif',
      layout: 'spacious' as const,
      style: 'flat' as const
    }
  },
  {
    name: 'Ocean',
    theme: {
      primaryColor: '#0EA5E9', // sky-500
      backgroundColor: '#F0F9FF', // sky-50
      textColor: '#0C4A6E', // sky-900
      borderRadius: '0.75rem', // rounded-xl
      fontFamily: 'Montserrat, sans-serif',
      layout: 'default' as const,
      style: 'shadow' as const
    }
  },
  {
    name: 'Forest',
    theme: {
      primaryColor: '#059669', // emerald-600
      backgroundColor: '#ECFDF5', // emerald-50
      textColor: '#064E3B', // emerald-900
      borderRadius: '0.375rem', // rounded-md
      fontFamily: 'Roboto, sans-serif',
      layout: 'spacious' as const,
      style: 'outline' as const
    }
  },
  {
    name: 'Sunset',
    theme: {
      primaryColor: '#F43F5E', // rose-500
      backgroundColor: '#FFF1F2', // rose-50
      textColor: '#881337', // rose-900
      borderRadius: '0.5rem', // rounded-lg
      fontFamily: 'Open Sans, sans-serif',
      layout: 'default' as const,
      style: 'shadow' as const
    }
  }
]

export function ThemePanel({ onThemeChange }: ThemePanelProps) {
  const { formTheme, setFormTheme } = useForm()
  const [selectedTheme, setSelectedTheme] = useState<FormTheme>(formTheme || defaultThemes[0].theme)
  const [customizing, setCustomizing] = useState(false)

  const handleThemeSelect = (theme: FormTheme) => {
    setSelectedTheme(theme)
    setFormTheme(theme)
    
    // Get current form data from session storage
    const formId = sessionStorage.getItem('currentFormId') || '1'
    const formName = sessionStorage.getItem('currentFormName') || 'My Form'
    const formElements = sessionStorage.getItem('currentFormElements')
    const formDescription = sessionStorage.getItem('currentFormDescription')
    
    // Save to session storage with updated theme
    saveFormToSessionStorage(
      formId,
      formName,
      formElements ? JSON.parse(formElements) : [],
      theme,
      formDescription || undefined
    )
    
    if (onThemeChange) {
      onThemeChange(theme)
    }
  }

  const handleCustomColorChange = (property: keyof FormTheme, value: string) => {
    const updatedTheme = { ...selectedTheme, [property]: value }
    setSelectedTheme(updatedTheme)
    setFormTheme(updatedTheme)
    
    // Get current form data from session storage
    const formId = sessionStorage.getItem('currentFormId') || '1'
    const formName = sessionStorage.getItem('currentFormName') || 'My Form'
    const formElements = sessionStorage.getItem('currentFormElements')
    const formDescription = sessionStorage.getItem('currentFormDescription')
    
    // Save to session storage with updated theme
    saveFormToSessionStorage(
      formId,
      formName,
      formElements ? JSON.parse(formElements) : [],
      updatedTheme,
      formDescription || undefined
    )
    
    if (onThemeChange) {
      onThemeChange(updatedTheme)
    }
  }

  return (
    <div className="p-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D9D9D9] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#BFBFBF] [scrollbar-width]:thin [scrollbar-color]:#D9D9D9_transparent">
      <div>
        <div className={styles.sectionDivider}></div>
        <div className={styles.sectionTitle}>Select Theme</div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {defaultThemes.map((item, index) => (
            <button
              key={index}
              onClick={() => handleThemeSelect(item.theme)}
              className={`p-3 border rounded-md text-left transition-all ${
                JSON.stringify(selectedTheme) === JSON.stringify(item.theme)
                  ? 'border-[#0072ff] ring-2 ring-[#0072ff]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.name}</span>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.theme.primaryColor }}
                ></div>
              </div>
              <div 
                className="h-10 rounded-md border border-gray-200 overflow-hidden"
                style={{ backgroundColor: item.theme.backgroundColor }}
              >
                <div 
                  className="h-2 mt-2 mx-2 rounded"
                  style={{ backgroundColor: item.theme.primaryColor }}
                ></div>
                <div className="flex justify-between px-2 mt-1">
                  <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                  <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between px-2 mt-1">
                  <div className="w-1/3 h-2 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={styles.sectionDivider}></div>
        <div className="flex items-center justify-between">
          <div className={styles.sectionTitle}>Customize</div>
          <button
            onClick={() => setCustomizing(!customizing)}
            className="text-xs btn-gradient px-3 py-1.5 rounded-md"
          >
            {customizing ? 'Hide Options' : 'Show Options'}
          </button>
        </div>

        {customizing && (
          <div className="space-y-4 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={selectedTheme.primaryColor}
                  onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedTheme.primaryColor}
                  onChange={(e) => handleCustomColorChange('primaryColor', e.target.value)}
                  className="ml-2 flex-1 p-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={selectedTheme.backgroundColor}
                  onChange={(e) => handleCustomColorChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedTheme.backgroundColor}
                  onChange={(e) => handleCustomColorChange('backgroundColor', e.target.value)}
                  className="ml-2 flex-1 p-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={selectedTheme.textColor}
                  onChange={(e) => handleCustomColorChange('textColor', e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedTheme.textColor}
                  onChange={(e) => handleCustomColorChange('textColor', e.target.value)}
                  className="ml-2 flex-1 p-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Border Radius
              </label>
              <select
                value={selectedTheme.borderRadius}
                onChange={(e) => handleCustomColorChange('borderRadius', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff]"
              >
                <option value="0">None</option>
                <option value="0.125rem">Small (2px)</option>
                <option value="0.25rem">Medium (4px)</option>
                <option value="0.375rem">Default (6px)</option>
                <option value="0.5rem">Large (8px)</option>
                <option value="0.75rem">Extra Large (12px)</option>
                <option value="9999px">Full</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Font Family
              </label>
              <select
                value={selectedTheme.fontFamily}
                onChange={(e) => handleCustomColorChange('fontFamily', e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff]"
              >
                <option value="Inter, sans-serif">Inter</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="system-ui, sans-serif">System UI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Layout
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['default', 'compact', 'spacious'] as const).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => handleCustomColorChange('layout', layout)}
                    className={`p-2 text-xs border rounded-md capitalize ${
                      selectedTheme.layout === layout
                        ? 'btn-gradient'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['flat', 'shadow', 'outline'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => handleCustomColorChange('style', style)}
                    className={`p-2 text-xs border rounded-md capitalize ${
                      selectedTheme.style === style
                        ? 'btn-gradient'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className={styles.sectionDivider}></div>
        <div className={styles.sectionTitle}>Preview</div>
        <div 
          className="p-4 border rounded-md mt-3"
          style={{ 
            backgroundColor: selectedTheme.backgroundColor,
            color: selectedTheme.textColor,
            fontFamily: selectedTheme.fontFamily,
            borderRadius: selectedTheme.borderRadius,
            boxShadow: selectedTheme.style === 'shadow' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
            borderWidth: selectedTheme.style === 'outline' ? '2px' : '1px',
            padding: selectedTheme.layout === 'compact' ? '0.5rem' : selectedTheme.layout === 'spacious' ? '1.5rem' : '1rem'
          }}
        >
          <div className="mb-3">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: selectedTheme.textColor }}
            >
              Sample Field
            </label>
            <input
              type="text"
              placeholder="Sample input"
              className="w-full p-2 border rounded-md"
              style={{ 
                borderRadius: selectedTheme.borderRadius,
                borderColor: selectedTheme.style === 'outline' ? selectedTheme.primaryColor : '#e5e7eb'
              }}
            />
          </div>
          <button
            className="w-full py-2 px-4 rounded-md btn-gradient"
            style={{ 
              borderRadius: selectedTheme.borderRadius
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export function ThemeTab() {
  return (
    <div className="h-full overflow-hidden">
      <ThemePanel />
    </div>
  )
} 