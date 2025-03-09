/**
 * Save form data to session storage
 */
export const saveFormToSessionStorage = (
  formId: number | string,
  formName: string,
  formElements: any[],
  formTheme?: any,
  formDescription?: string
) => {
  try {
    // Save form data to session storage
    sessionStorage.setItem('currentFormId', formId.toString());
    sessionStorage.setItem('currentFormName', formName);
    sessionStorage.setItem('currentFormElements', JSON.stringify(formElements));
    
    if (formTheme) {
      sessionStorage.setItem('currentFormTheme', JSON.stringify(formTheme));
    }
    
    if (formDescription) {
      sessionStorage.setItem('currentFormDescription', formDescription);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving form to session storage:', error);
    return false;
  }
};

/**
 * Load form data from session storage
 */
export const loadFormFromSessionStorage = () => {
  try {
    const formId = sessionStorage.getItem('currentFormId');
    const formName = sessionStorage.getItem('currentFormName');
    const formElements = sessionStorage.getItem('currentFormElements');
    const formTheme = sessionStorage.getItem('currentFormTheme');
    const formDescription = sessionStorage.getItem('currentFormDescription');
    
    if (!formId || !formName || !formElements) {
      return null;
    }
    
    return {
      formId: parseInt(formId),
      formName,
      formElements: JSON.parse(formElements),
      formTheme: formTheme ? JSON.parse(formTheme) : undefined,
      formDescription
    };
  } catch (error) {
    console.error('Error loading form from session storage:', error);
    return null;
  }
};

/**
 * Clear form data from session storage
 */
export const clearFormFromSessionStorage = () => {
  try {
    sessionStorage.removeItem('currentFormId');
    sessionStorage.removeItem('currentFormName');
    sessionStorage.removeItem('currentFormElements');
    sessionStorage.removeItem('currentFormTheme');
    sessionStorage.removeItem('currentFormDescription');
    return true;
  } catch (error) {
    console.error('Error clearing form from session storage:', error);
    return false;
  }
}; 