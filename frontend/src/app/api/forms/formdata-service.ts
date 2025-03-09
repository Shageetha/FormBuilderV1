// Using built-in fetch API instead of axios
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  layout: string;
  style: string;
}

export interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  validation?: any;
  value?: string;
  size?: string;
}

export interface FormDataCreate {
  form_id: number;
  form_name: string;
  form_description?: string;
  form_elements: FormElement[];
  form_theme?: FormTheme;
  user_id: number;
}

export interface FormDataResponse {
  id: number;
  form_id: number;
  form_name: string;
  form_description?: string;
  form_elements: FormElement[];
  form_theme?: FormTheme;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Save form data from session storage to the database
 */
export const saveFormDataFromSession = async (): Promise<FormDataResponse | null> => {
  try {
    // Get data from session storage
    const formId = sessionStorage.getItem('currentFormId');
    const formName = sessionStorage.getItem('currentFormName');
    const formDescription = sessionStorage.getItem('currentFormDescription');
    const formElements = sessionStorage.getItem('currentFormElements');
    const formTheme = sessionStorage.getItem('currentFormTheme');
    const userId = sessionStorage.getItem('userId');

    // Validate required data
    if (!formId || !formName || !formElements || !userId) {
      console.error('Missing required form data in session storage');
      return null;
    }

    // Prepare request data
    const requestData: FormDataCreate = {
      form_id: parseInt(formId),
      form_name: formName,
      form_description: formDescription || undefined,
      form_elements: JSON.parse(formElements),
      form_theme: formTheme ? JSON.parse(formTheme) : undefined,
      user_id: parseInt(userId)
    };

    // Send request to API using fetch
    const response = await fetch(`${API_URL}/api/formdata/formdata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving form data:', error);
    return null;
  }
};

/**
 * Get form data by form ID
 */
export const getFormDataById = async (formId: number): Promise<FormDataResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/api/formdata/formdata/${formId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching form data for ID ${formId}:`, error);
    return null;
  }
};

/**
 * Get all form data for a user
 */
export const getUserFormData = async (userId: number): Promise<FormDataResponse[]> => {
  try {
    const response = await fetch(`${API_URL}/api/formdata/formdata/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching form data for user ${userId}:`, error);
    return [];
  }
};

/**
 * Update form data
 */
export const updateFormData = async (id: number, formData: FormDataCreate): Promise<FormDataResponse | null> => {
  try {
    const response = await fetch(`${API_URL}/api/formdata/formdata/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating form data with ID ${id}:`, error);
    return null;
  }
};

/**
 * Delete form data
 */
export const deleteFormData = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/formdata/formdata/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting form data with ID ${id}:`, error);
    return false;
  }
}; 