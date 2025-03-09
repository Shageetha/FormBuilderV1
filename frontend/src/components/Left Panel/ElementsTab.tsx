import React from 'react';
import { FormAction } from '@/types/form';
import { FieldSettings } from '@/components/Left Panel/FieldSettings';
import styles from '@/components/Left Panel/TabStyles.module.css';

interface ElementsTabProps {
  onAddField: (action: FormAction) => void;
}

export function ElementsTab({ onAddField }: ElementsTabProps) {
  return (
    <div>
      <FieldSettings onAddField={onAddField} />
    </div>
  );
}
