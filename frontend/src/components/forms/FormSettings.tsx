"use client"

import React, { useState, useEffect } from 'react'
import { QuestionMarkCircleIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useForm } from '@/components/Form_Preview/FormContext'
import { FormElement } from '@/types/form'
import styles from '@/components/Left Panel/TabStyles.module.css'

interface FieldSettingProps {
  label: string
  tooltip?: string
  children: React.ReactNode
}

function FieldSetting({ label, tooltip, children }: FieldSettingProps) {
  return (
    <div className="flex items-start gap-4 py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className="w-24 flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-[14px] font-semibold text-gray-700">{label}</span>
          {tooltip && (
            <QuestionMarkCircleIcon 
              className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" 
              title={tooltip}
            />
          )}
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

interface FormSettingsProps {
  activeFieldId: string | null
}

export function FormSettings({ activeFieldId }: FormSettingsProps) {
  const { formElements, setFormElements } = useForm()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const activeField = formElements.find(el => el.id === activeFieldId)

  const updateField = (updates: Partial<FormElement>) => {
    if (!activeFieldId) return

    setFormElements(formElements.map(field => 
      field.id === activeFieldId 
        ? { ...field, ...updates }
        : field
    ))
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-[15px] font-semibold text-gray-900">Field Properties</h2>
      </div>
      
      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D9D9D9] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#BFBFBF] [scrollbar-width]:thin [scrollbar-color]:#D9D9D9_transparent"
      >
        <div>
          <div className={styles.sectionDivider}></div>
          <div className={styles.sectionTitle}>Properties</div>
          
          <div className="divide-y divide-gray-100 mt-2">
            <FieldSetting label="Label">
              <input 
                type="text"
                value={activeField?.label || ''}
                onChange={(e) => updateField({ label: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff] hover:border-gray-400 transition-colors"
                placeholder="Click text on page to modify"
              />
            </FieldSetting>

            <FieldSetting label="Caption">
              <input 
                type="text"
                value={activeField?.caption || ''}
                onChange={(e) => updateField({ caption: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff] hover:border-gray-400 transition-colors"
                placeholder="Add a caption"
              />
            </FieldSetting>

            <FieldSetting label="Placeholder">
              <input 
                type="text"
                value={activeField?.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0072ff] focus:border-[#0072ff] hover:border-gray-400 transition-colors"
                placeholder="Add a placeholder"
              />
            </FieldSetting>

            <FieldSetting label="Required">
              <div className="flex justify-end">
                <div className="relative inline-block w-8 align-middle select-none">
                  <input 
                    type="checkbox" 
                    checked={activeField?.required || false}
                    onChange={(e) => updateField({ required: e.target.checked })}
                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-2 appearance-none cursor-pointer checked:right-0 right-4 top-0.5 checked:border-[#ff00c8] border-gray-300 transition-all duration-200"
                  />
                  <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-200 cursor-pointer" />
                </div>
              </div>
            </FieldSetting>
          </div>
        </div>
      </div>
      <style jsx>{`
        .toggle-checkbox:checked + .toggle-label {
          background: linear-gradient(90deg, #0072ff 0%, #ff00c8 100%);
        }
        .toggle-checkbox:checked {
          border-color: #ff00c8;
        }
      `}</style>
    </div>
  )
} 