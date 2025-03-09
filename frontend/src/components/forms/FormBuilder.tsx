"use client"

import React, { useState, useEffect } from 'react'
import { FormPreview } from '../Form_Preview/FormPreview'
import { LeftPanel } from '../Left Panel/LeftPanel'
import { FormElement, FormAction, FormElementType } from '@/types/form'
import { useForm } from '@/components/Form_Preview/FormContext'
import { updateForm, saveForm } from './FormSaver'
import AIChatPanel from '../chat/AIChatPanel'
import { useToast } from '@/components/ui/Toast'
import { HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { saveFormDataFromSession } from '@/app/api/forms/formdata-service'
import { saveFormToSessionStorage } from '@/utils/sessionStorage'

interface FormBuilderProps {
  formId?: number;
  formName?: string;
  formData: string;
}

export default function FormBuilder({ formId, formName, formData }: FormBuilderProps) {
  const { formElements, setFormElements, setFormName } = useForm()
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const { showToast } = useToast()
  const router = useRouter()
  const { user } = useUser()
  const userId = user?.id || 1
  const { logout } = useAuth()

  useEffect(() => {
    if (formId && formName) {
      sessionStorage.setItem('currentFormId', formId.toString());
      sessionStorage.setItem('currentFormName', formName);
    }
  }, [formId, formName]);

  useEffect(() => {
    if (formData) {
      try {
        const parsedData = JSON.parse(formData)
        setFormElements(parsedData)
      } catch (error) {
        console.error('Error parsing form data:', error)
      }
    }
  }, [formData])

  const handleAddField = (action: FormAction) => {
    if (action.type === 'ADD') {
      const updatedFields = [...formElements, action.element];
      setFormElements(updatedFields);
      setActiveFieldId(action.element.id);
      
      // Save to session storage
      saveFormToSessionStorage(
        formId || 1,
        formName || 'My Form',
        updatedFields,
        formTheme
      );
    } else if (action.type === 'UPDATE') {
      setFormElements(action.elements)
      triggerUpdate(action.elements)
    }
  }

  const handleFieldChange = (updatedFields: FormElement[]) => {
    setFormElements(updatedFields);
    
    // Save to session storage
    saveFormToSessionStorage(
      formId || 1,
      formName || 'My Form',
      updatedFields,
      formTheme
    );
  }

  const handleLabelChange = (fieldId: string, newLabel: string) => {
    const updatedFields = formElements.map(field => 
      field.id === fieldId ? { ...field, label: newLabel } : field
    );
    setFormElements(updatedFields);
    
    // Save to session storage
    saveFormToSessionStorage(
      formId || 1,
      formName || 'My Form',
      updatedFields,
      formTheme
    );
  }

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = formElements.filter(field => field.id !== fieldId);
    setFormElements(updatedFields);
    setActiveFieldId(null);
    
    // Save to session storage
    saveFormToSessionStorage(
      formId || 1,
      formName || 'My Form',
      updatedFields,
      formTheme
    );
  }

  const triggerUpdate = async (updatedFields: FormElement[]) => {
    const existingFormId = sessionStorage.getItem('currentFormId');
    const updateFormId = formId || Number(existingFormId ?? '0');
    const updateFormName = formName || (sessionStorage.getItem('currentFormName') ?? 'Untitled Form');
    const currentTime = new Date().toISOString();

    try {
      if (existingFormId) {
        const updateData = {
          form_id: updateFormId,
          form_name: updateFormName,
          fields: updatedFields,
          user_id: userId,
          updated_at: currentTime
        };

        console.log('Updating form with data:', updateData);
        await updateForm(updateData);
        console.log('Form updated successfully');
        showToast({
          title: 'Form updated',
          description: 'Your form has been updated successfully',
          type: 'success',
        });
      } else {
        const response = await saveForm(updateFormName, updatedFields, userId);
        sessionStorage.setItem('currentFormId', response.form_id.toString());
        sessionStorage.setItem('currentFormName', response.form_name);
        console.log('Form saved successfully');
        showToast({
          title: 'Form saved',
          description: 'Your form has been automatically saved',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating form:', error);
      showToast({
        title: 'Error',
        description: 'There was an error processing the form.',
        type: 'error',
      });
    }
  };

  const handleFieldTypeChange = (fieldId: string, newType: FormElementType) => {
    console.log('Field type change requested:', { fieldId, newType })
    const updatedFields = formElements.map(field => {
      if (field.id === fieldId) {
        // Create new field with updated type while preserving other properties
        const updatedField = {
          ...field,
          type: newType,
          // Reset or set type-specific properties
          options: ['multiple-choice', 'dropdown', 'checkbox'].includes(newType) 
            ? field.options || ['Option 1', 'Option 2']
            : undefined,
          value: undefined, // Reset value when type changes
          validation: getDefaultValidationForType(newType),
        }
        console.log('Updated field:', updatedField)
        return updatedField
      }
      return field
    })
    
    console.log('Updated elements:', updatedFields)
    handleFieldChange(updatedFields)
  }

  // Helper function to get default validation rules for different field types
  const getDefaultValidationForType = (type: FormElementType) => {
    switch (type) {
      case 'email':
        return { required: false, email: true };
      case 'tel':
        return { required: false, phone: true };
      default:
        return { required: false };
    }
  };

  const handlePreviewClick = () => {
    const formId = sessionStorage.getItem('currentFormId')
    if (formId) {
      // Generate a shareable URL
      const shareableUrl = `${window.location.origin}/forms/preview/${formId}`
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareableUrl)
        .then(() => {
          showToast({
            title: 'Link Copied!',
            description: 'Preview link has been copied to clipboard',
            type: 'success',
          })
        })
        .catch(() => {
          showToast({
            title: 'Failed to copy',
            description: 'Please copy the URL manually',
            type: 'error',
          })
        })

      // Navigate to preview
      router.push(`/forms/preview/${formId}`)
    } else {
      showToast({
        title: 'Error',
        description: 'No form found to preview',
        type: 'error',
      })
    }
  }

  const handleFormAction = (action: FormAction) => {
    if (action.type === 'UPDATE' && action.formName) {
      // Update form name in your state or database
      setFormName(action.formName)
    }
    // ... rest of your form action handling
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handlePublish = async () => {
    try {
      // Save current form state to session storage
      if (formElements.length > 0) {
        sessionStorage.setItem('currentFormElements', JSON.stringify(formElements));
      }
      
      // Save form data to database
      const result = await saveFormDataFromSession();
      
      if (result) {
        alert('Form published successfully!');
      } else {
        alert('Failed to publish form. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing form:', error);
      alert('An error occurred while publishing the form.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeIcon className="w-5 h-5 text-gray-500" />
            <h1 className="text-xl font-semibold text-gray-800">Form builder</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center space-x-4">
              {formId && (
                <Link
                  href={`/forms/preview/${formId}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Preview Form
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-md btn-gradient flex items-center gap-2"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
              <button 
                onClick={handlePublish}
                className="px-4 py-2 rounded-md btn-gradient flex items-center gap-2"
              >
                Publish
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-[1_1_20%] border-r bg-gray-50 border-x-[0.5px] border-gray-300 w-[226px] lg:w-[300px]">
          <LeftPanel 
            onAddField={handleAddField} 
            activeFieldId={activeFieldId}
            onFieldSelect={setActiveFieldId}
          />
        </div>
        <div className="flex-[1_1_50%] border-r overflow-y-auto">
          <FormPreview 
            elements={formElements} 
            onAddField={handleAddField}
            onSettingsClick={setActiveFieldId}
            onDeleteField={handleDeleteField}
            onLabelChange={handleLabelChange}
            onSwapField={handleFieldTypeChange}
          />
        </div>
        <div className="flex-[1_1_30%] overflow-y-auto">
          <AIChatPanel />
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-2 px-4 text-center text-sm text-gray-500">
        © 2025 Form Builder. All rights reserved.
      </footer>
    </div>
  )
} 