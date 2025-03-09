import React, { useState, useEffect } from 'react'
import { FormAction } from '@/types/form'
import { ElementsTab } from '@/components/Left Panel/ElementsTab'
import { SettingsTab } from './SettingsTab'
import { ThemeTab } from './ThemeTab'
import styles from '@/components/Left Panel/TabStyles.module.css'
import { 
  Squares2X2Icon, 
  Cog6ToothIcon, 
  SwatchIcon 
} from '@heroicons/react/24/outline'

// Function to inject custom scrollbar styles if not already present
function applyScrollbarStyles() {
  if (typeof document !== 'undefined') {
    if (!document.getElementById('custom-scrollbar-styles')) {
      const style = document.createElement('style')
      style.id = 'custom-scrollbar-styles'
      style.textContent = `
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
      document.head.appendChild(style)
    }
  }
}

interface LeftPanelProps {
  onAddField: (action: FormAction) => void;
  activeFieldId: string | null;
}

export function LeftPanel({ onAddField, activeFieldId }: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<'elements' | 'settings' | 'theme'>('elements')

  // Apply custom scrollbar styles on component mount
  useEffect(() => {
    applyScrollbarStyles()
  }, [])

  const getTabTitle = () => {
    switch (activeTab) {
      case 'elements': return 'Form Elements'
      case 'settings': return 'Field Settings'
      case 'theme': return 'Form Theme'
    }
  }

  return (
    <div className="h-full bg-white rounded-tr-lg rounded-br-lg shadow-md border-r border-t border-b border-gray-200">
      <div className="flex bg-gradient-to-r from-[#0072ff] to-[#ff00c8] text-white rounded-tr-lg border-b border-gray-200">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex items-center justify-center py-3 px-4 ${
            activeTab === 'elements' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <Squares2X2Icon className="h-5 w-5" />
          <span className="ml-2 text-sm font-medium">Elements</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-center py-3 px-4 ${
            activeTab === 'settings' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <Cog6ToothIcon className="h-5 w-5" />
          <span className="ml-2 text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center justify-center py-3 px-4 ${
            activeTab === 'theme' ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <SwatchIcon className="h-5 w-5" />
          <span className="ml-2 text-sm font-medium">Theme</span>
        </button>
      </div>
      
      <div className="h-[calc(100%-48px)] border-t border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <h2 className="text-[15px] font-semibold text-gray-900">{getTabTitle()}</h2>
        </div>
        
        {/* Add the custom-scrollbar class to the scrollable content container */}
        <div className="h-[calc(100%-48px)] custom-scrollbar overflow-auto">
          {activeTab === 'elements' && <ElementsTab onAddField={onAddField} />}
          {activeTab === 'settings' && <SettingsTab activeFieldId={activeFieldId} />}
          {activeTab === 'theme' && <ThemeTab />}
        </div>
      </div>
    </div>
  )
}
