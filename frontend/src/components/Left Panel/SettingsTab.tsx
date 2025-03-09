import React from 'react'
import { FormSettings } from '../forms/FormSettings'
import styles from './TabStyles.module.css'

interface SettingsTabProps {
  activeFieldId: string | null;
}

export function SettingsTab({ activeFieldId }: SettingsTabProps) {
  return (
    <div className="h-full overflow-hidden">
      <FormSettings activeFieldId={activeFieldId} />
    </div>
  )
} 