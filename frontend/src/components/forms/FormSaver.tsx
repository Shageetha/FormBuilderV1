import { FormElement } from '@/types/form'

// types.ts
interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  caption?: string;
  options?: string[];
  value?: string | string[] | boolean;
}

interface FormResponse {
  message: string;
  form_id: number;
  form_name: string;
  user_id: number;
  form_data?: FormField[];  // For get response
  updated_at?: string;
}

interface FormUpdate {
  form_id: number;
  form_name: string;
  fields: FormField[];
  user_id: number;
  updated_at: string;
}

// form-service.ts
export async function saveForm(formName: string, formFields: FormField[], userId: number): Promise<FormResponse> {
  try {
    if (!formFields || formFields.length === 0) {
      throw new Error('No form fields provided');
    }

    const simplifiedFields = formFields.map(field => ({
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required || false,
      options: field.options || [],
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`
    }));

    // Ensure we have a valid form name and timestamp
    const currentTimestamp = new Date().toISOString();
    const validFormName = formName?.trim() || 'Untitled Form';

    const payload = {
      form_name: validFormName,
      fields: simplifiedFields,
      user_id: userId,
      updated_at: currentTimestamp,
      created_at: currentTimestamp
    };

    console.log('Saving form with payload:', payload);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/forms/auto-save';
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save form';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `${errorMessage}: ${response.statusText}`;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (!result.form_id) {
      throw new Error('No form ID returned from server');
    }

    // Store form name from API response
    sessionStorage.setItem('currentFormName', result.form_name);
    sessionStorage.setItem('currentFormId', result.form_id.toString());
    
    return result;
  } catch (error) {
    console.error('SaveForm Error:', error);
    throw error;
  }
}

export async function updateForm(formUpdate: FormUpdate): Promise<FormResponse> {
  try {
    if (!formUpdate.form_id) {
      throw new Error('Form ID is required for updates');
    }

    const simplifiedFields = formUpdate.fields.map(field => ({
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required || false,
      options: field.options || [],
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`
    }));

    const payload = {
      form_id: formUpdate.form_id,
      form_name: formUpdate.form_name?.trim() || 'Untitled Form',
      fields: simplifiedFields,
      user_id: formUpdate.user_id,
      updated_at: new Date().toISOString()
    };

    try {
      // First try to update the form
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/forms/update';
      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();
      
      // If the form doesn't exist, create a new one
      if (!response.ok && (data.detail?.includes('not found') || response.status === 404)) {
        console.log('Form not found, creating a new one instead');
        return await saveForm(formUpdate.form_name, formUpdate.fields, formUpdate.user_id);
      }
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update form');
      }

      return data;
    } catch (error: any) {
      // If there's a network error or other issue, try to create a new form
      if (error.message?.includes('not found') || error.message?.includes('Failed to fetch')) {
        console.log('Error updating form, creating a new one instead:', error);
        return await saveForm(formUpdate.form_name, formUpdate.fields, formUpdate.user_id);
      }
      throw error;
    }
  } catch (error) {
    console.error('UpdateForm Error:', error);
    throw error;
  }
}

// Add function to get form data
export async function getFormData(formId: number): Promise<FormResponse> {
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forms/${formId}`;
    
    const response = await fetch(backendUrl);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch form data: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('Get Form Response:', result);
    return result;
  } catch (error) {
    console.error('GetForm Error:', error);
    throw error;
  }
}

export async function autoSaveForm(formId: number, formName: string, fields: FormElement[]) {
  const userId = Number(sessionStorage.getItem('userId')) || 1; // Get userId from session or default
  return updateForm({
    form_id: formId,
    form_name: formName?.trim() || 'Untitled Form',
    fields: fields,
    user_id: userId,
    updated_at: new Date().toISOString()
  });
}