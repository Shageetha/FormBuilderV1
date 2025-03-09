import React, { useEffect } from 'react'
import { LeftPanel } from '../Left Panel/LeftPanel'
import { FormPreview } from '../Form_Preview/FormPreview'
import { FormElement, FormAction, FormElementType } from '@/types/form'
import { useForm } from '@/components/Form_Preview/FormContext'

interface FormLayoutProps {
  formElements: FormElement[]
  onUpdateElements?: (elements: FormElement[]) => void
}

export function FormLayout({ formElements }: FormLayoutProps) {
  const [elements, setElements] = React.useState<FormElement[]>(formElements)
  const [activeFieldId, setActiveFieldId] = React.useState<string | null>(null)
  const { setFormElements } = useForm()

  useEffect(() => {
    setElements(formElements)
  }, [formElements])

  const handleSwapField = (fieldId: string, newType: FormElementType) => {
    console.log('🔄 FormLayout: handleSwapField called', { fieldId, newType })
    
    const updatedElements = elements.map(field => {
      if (field.id === fieldId) {
        console.log('🔄 FormLayout: Updating field', { 
          oldType: field.type, 
          newType,
          fieldId 
        })
        return {
          ...field,
          type: newType,
          options: ['multiple-choice', 'dropdown', 'checkbox'].includes(newType) 
            ? field.options || ['Option 1', 'Option 2']
            : undefined,
          value: undefined
        }
      }
      return field
    })

    console.log('🔄 FormLayout: Setting updated elements')
    setElements(updatedElements)
    setFormElements(updatedElements)
  }

  const handleAddField = (action: FormAction) => {
    if (action.type === 'ADD') {
      const updatedElements = [...elements, action.element]
      setElements(updatedElements)
      setFormElements(updatedElements)
    } else if (action.type === 'UPDATE') {
      setElements(action.elements)
      setFormElements(action.elements)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex w-full items-start justify-start flex-col">
          <div id="flow-view" className="flex justify-center w-full h-full flex-col items-center">
            <div className="flex w-full h-full justify-center">
              <LeftPanel 
                onAddField={handleAddField} 
                activeFieldId={activeFieldId}
                onFieldSelect={setActiveFieldId}
              />
              <div className="flex-1">
                <div className="h-full flex flex-col bg-gray-50">
                  <FormPreview 
                    elements={elements} 
                    onAddField={handleAddField}
                    onSettingsClick={setActiveFieldId}
                    onDeleteField={(fieldId) => {
                      const updatedElements = elements.filter(field => field.id !== fieldId)
                      setElements(updatedElements)
                      setFormElements(updatedElements)
                    }}
                    onLabelChange={(fieldId, newLabel) => {
                      const updatedElements = elements.map(field =>
                        field.id === fieldId ? { ...field, label: newLabel } : field
                      )
                      setElements(updatedElements)
                      setFormElements(updatedElements)
                    }}
                    onSwapField={handleSwapField}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        /* Custom scrollbar styles */
        * {
          scrollbar-width: thin;
          scrollbar-color: #D9D9D9 transparent;
        }
        
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: #D9D9D9;
          border-radius: 9999px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background-color: #BFBFBF;
        }
      `}</style>
    </div>
  )
} 