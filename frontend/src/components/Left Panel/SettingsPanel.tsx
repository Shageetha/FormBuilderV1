import React from 'react'
import styles from './SettingsPanel.module.css'
import { FormAction } from '@/types/form'
import { FieldSettings } from './FieldSettings'
import { FormSettings } from './FormSettings'
import { ThemePanel } from './ThemePanel'

interface SettingsPanelProps {
  onAddField: (action: FormAction) => void;
  activeFieldId: string | null;
  onFieldSelect: (fieldId: string | null) => void;
}

export function SettingsPanel({ onAddField, activeFieldId, onFieldSelect }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'fields' | 'form' | 'theme'>('fields')

  React.useEffect(() => {
    if (activeFieldId) {
      setActiveTab('form')
    }
  }, [activeFieldId])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 border-x-[0.5px] border-gray-300 w-[250px] lg:w-[350px] animate-fadeIn">
      <div className="flex flex-col w-full h-full border border-gray-300">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'fields'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-[14px]">Elements</span>
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'form'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-[14px]">Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'theme'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-[14px]">Theme</span>
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 ${styles.scrollbar}`}>
          {activeTab === 'fields' ? (
            <FieldSettings onAddField={onAddField} />
          ) : activeTab === 'form' ? (
            <FormSettings activeFieldId={activeFieldId} />
          ) : (
            <ThemePanel />
          )}
        </div>
      </div>
    </div>
  )
}