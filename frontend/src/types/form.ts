export type FormElementType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'file'
  | 'hidden'
  | 'range'
  | 'color'
  | 'rating'

export interface FormElement {
  id: string
  type: FormElementType
  label: string
  placeholder?: string
  caption?: string
  required?: boolean
  options?: string[]
  value?: string | string[] | boolean
  validation?: {
    required?: boolean
    email?: boolean
    phone?: boolean
    min?: number
    max?: number
  }
  size?: 'normal' | 'large' | 'small'
  width?: string;
  accept?: string;  // For file input accept attribute
  multiple?: boolean;  // Added for file input
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number;
}

export type FormAction = 
  | { type: 'ADD', element: FormElement }
  | { type: 'UPDATE', elements: FormElement[], formName?: string } 