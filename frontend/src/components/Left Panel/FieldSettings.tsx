import React from 'react'
import { useDrag } from 'react-dnd'
import { FormAction, FormElementType } from '@/types/form'
import styles from '@/components/Left Panel/TabStyles.module.css'
import {
  HashtagIcon as HashIcon,
  EnvelopeIcon as EmailIcon,
  LockClosedIcon as LockIcon,
  PhoneIcon,
  LinkIcon,
  MagnifyingGlassIcon as SearchIcon,
  DocumentTextIcon as TextAreaIcon,
  DocumentIcon as TextIcon,
  ListBulletIcon as SelectIcon,
  CheckCircleIcon as CheckIcon,
  RadioIcon,
  CalendarIcon,
  ClockIcon,
  CalendarDaysIcon as CalendarClockIcon,
  CalendarIcon as CalendarMonthIcon,
  CalendarIcon as CalendarWeekIcon,
  PaperClipIcon as FileIcon,
  EyeSlashIcon as EyeOffIcon,
  AdjustmentsHorizontalIcon as SliderIcon,
  SwatchIcon as ColorIcon,
  StarIcon
} from '@heroicons/react/24/outline'

// Add after imports
interface FieldConfig {
  id: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

// Define valid HTML input types
const basicFields = [
  { id: 'text', label: 'Text Input', icon: TextIcon },
  { id: 'email', label: 'Email', icon: EmailIcon },
  { id: 'password', label: 'Password', icon: LockIcon },
  { id: 'number', label: 'Number', icon: HashIcon },
  { id: 'tel', label: 'Phone', icon: PhoneIcon },
  { id: 'url', label: 'URL', icon: LinkIcon },
  { id: 'search', label: 'Search', icon: SearchIcon },
  { id: 'textarea', label: 'Text Area', icon: TextAreaIcon }
]

const selectionFields = [
  { id: 'select', label: 'Dropdown', icon: SelectIcon },
  { id: 'radio', label: 'Radio Group', icon: RadioIcon },
  { id: 'checkbox', label: 'Checkbox', icon: CheckIcon }
]

const dateTimeFields = [
  { id: 'date', label: 'Date', icon: CalendarIcon },
  { id: 'time', label: 'Time', icon: ClockIcon },
  { id: 'datetime-local', label: 'Date & Time', icon: CalendarClockIcon },
  { id: 'month', label: 'Month', icon: CalendarMonthIcon },
  { id: 'week', label: 'Week', icon: CalendarWeekIcon }
]

const advancedFields = [
  { id: 'file', label: 'File Upload', icon: FileIcon },
  { id: 'hidden', label: 'Hidden Input', icon: EyeOffIcon },
  { id: 'range', label: 'Range Slider', icon: SliderIcon },
  { id: 'color', label: 'Color Picker', icon: ColorIcon },
  { id: 'rating', label: 'Star Rating', icon: StarIcon }
]

function FieldSection({ title, fields, onAddField }: { 
  title: string
  fields: FieldConfig[]
  onAddField: (action: FormAction) => void 
}) {
  return (
    <div className="mb-6">
      <div className={styles.sectionDivider}></div>
      <div className={styles.sectionTitle}>{title}</div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-3 gap-y-4">
        {fields.map((field) => (
          <FieldButton key={field.id} field={field} onAddField={onAddField} />
        ))}
      </div>
    </div>
  )
}

function FieldButton({ field, onAddField }: { 
  field: FieldConfig
  onAddField: (action: FormAction) => void 
}) {
  const dragRef = React.useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag({
    type: 'FORM_ELEMENT',
    item: () => ({
      type: field.id,
      placeholder: getDefaultPlaceholder(field.id)
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (!dropResult && !monitor.didDrop()) {
        handleClick()
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const getDefaultPlaceholder = (type: string) => {
    switch (type) {
      case 'email': return 'Enter email address'
      case 'tel': return 'Enter phone number'
      case 'url': return 'Enter website URL'
      case 'number': return 'Enter number'
      case 'password': return '••••••••'
      case 'search': return 'Search...'
      default: return `Enter ${field.label.toLowerCase()}...`
    }
  }

  const handleClick = () => {
    onAddField({
      type: 'ADD',
      element: {
        id: `${field.id}-${Date.now()}`,
        type: field.id as FormElementType,
        label: getDefaultLabel(field.id),
        placeholder: getDefaultPlaceholder(field.id),
        required: false,
        validation: getDefaultValidation(field.id),
        options: ['select', 'radio', 'checkbox'].includes(field.id) ? ['Option 1', 'Option 2'] : undefined
      }
    })
  }

  const getDefaultLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email Address'
      case 'tel': return 'Phone Number'
      case 'url': return 'Website URL'
      case 'password': return 'Password'
      case 'search': return 'Search'
      default: return 'Type your question here'
    }
  }

  const getDefaultValidation = (type: string) => {
    switch (type) {
      case 'number': return { required: false, min: 0, max: 999999 }
      case 'range': return { required: false, min: 0, max: 100 }
      default: return { required: false }
    }
  }

  drag(dragRef)

  return (
    <div 
      ref={dragRef}
      onClick={handleClick}
      className={`bg-white px-[3px] flex flex-col pt-3 pb-[6px] items-center rounded-md cursor-move 
                 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200
                 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="p-1.5 rounded-full bg-gradient-to-r from-[#0072ff] to-[#ff00c8] bg-opacity-10">
        <field.icon className="h-5 w-5 text-gray-700" />
      </div>
      <div className="text-gray-700 text-xs font-medium flex justify-center mt-2 text-center leading-3 h-6 items-center">
        {field.label}
      </div>
    </div>
  )
}

export function FieldSettings({ onAddField }: { onAddField: (action: FormAction) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="search"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-[#0072ff] focus:border-[#0072ff] transition-all"
            placeholder="Search fields..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D9D9D9] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#BFBFBF] [scrollbar-width]:thin [scrollbar-color]:#D9D9D9_transparent">
        <div className="p-4 space-y-2">
          <FieldSection title="Basic Fields" fields={basicFields} onAddField={onAddField} />
          <FieldSection title="Selection Fields" fields={selectionFields} onAddField={onAddField} />
          <FieldSection title="Date & Time" fields={dateTimeFields} onAddField={onAddField} />
          <FieldSection title="Advanced Fields" fields={advancedFields} onAddField={onAddField} />
        </div>
      </div>
    </div>
  )
} 