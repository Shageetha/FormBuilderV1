import { DocumentTextIcon, DocumentIcon, EnvelopeIcon, PhoneIcon, HomeIcon, CalendarIcon, ClockIcon, CalendarDaysIcon, ListBulletIcon, ChevronDownIcon, CheckIcon, ArrowPathIcon, StarIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

export const basicFields = [
  { id: 'short-answer', icon: DocumentTextIcon, label: 'Short answer' },
  { id: 'paragraph', icon: DocumentIcon, label: 'Paragraph' },
  { id: 'email', icon: EnvelopeIcon, label: 'Email' },
  { id: 'phone-number', icon: PhoneIcon, label: 'Phone' },
  { id: 'address', icon: HomeIcon, label: 'Address' },
]

export const dateTimeFields = [
  { id: 'date-picker', icon: CalendarIcon, label: 'Date' },
  { id: 'time-picker', icon: ClockIcon, label: 'Time' },
  { id: 'date-time-picker', icon: ClockIcon, label: 'Date & Time' },
  { id: 'date-range', icon: CalendarDaysIcon, label: 'Date Range' },
]

export const choiceFields = [
  { id: 'multiple-choice', icon: ListBulletIcon, label: 'Multiple Choice' },
  { id: 'dropdown', icon: ChevronDownIcon, label: 'Dropdown' },
  { id: 'checkbox', icon: CheckIcon, label: 'Checkbox' },
  { id: 'switch', icon: ArrowPathIcon, label: 'Switch' },
]

export const ratingFields = [
  { id: 'star-rating', icon: StarIcon, label: 'Star Rating' },
  { id: 'slider', icon: AdjustmentsHorizontalIcon, label: 'Slider' },
]

