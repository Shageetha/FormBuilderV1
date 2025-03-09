export interface FormModificationRule {
  action: 'add' | 'update' | 'delete' | 'reorder' | 'style'
  target: 'field' | 'section' | 'form'
  allowedFields: string[]
  maxFields?: number
  restrictions?: string[]
}

export const formAIRules: FormModificationRule[] = [
  {
    action: 'add',
    target: 'field',
    allowedFields: [
      'short-answer',
      'paragraph',
      'email',
      'phone-number',
      'multiple-choice',
      'dropdown',
      'checkbox',
      'date-picker',
      'time-picker',
      'star-rating'
    ],
    maxFields: 20,
    restrictions: [
      'Must include field label',
      'Must specify field type',
      'Cannot add duplicate IDs'
    ]
  },
  {
    action: 'update',
    target: 'field',
    allowedFields: ['label', 'type', 'required', 'options', 'placeholder'],
    restrictions: [
      'Cannot modify field ID',
      'Must maintain field type compatibility',
      'Must preserve existing validations'
    ]
  },
  {
    action: 'delete',
    target: 'field',
    allowedFields: ['any'],
    restrictions: [
      'Must confirm deletion',
      'Cannot delete all fields simultaneously'
    ]
  },
  {
    action: 'reorder',
    target: 'field',
    allowedFields: ['any'],
    restrictions: [
      'Must specify new position',
      'Must maintain form structure'
    ]
  },
  {
    action: 'style',
    target: 'field',
    allowedFields: ['size', 'layout'],
    restrictions: [
      'Only predefined sizes allowed: small, normal, large',
      'Must maintain responsive design'
    ]
  }
] 