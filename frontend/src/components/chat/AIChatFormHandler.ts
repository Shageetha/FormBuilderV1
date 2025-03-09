import { FormElement, FormAction, FormElementType } from '@/types/form'
import { formAIRules, FormModificationRule } from '@/types/aiRules'
import { v4 as uuidv4 } from 'uuid'

interface AIResponse {
  formName: string
  fields: Array<{
    id: string
    type: FormElementType
    label: string
    placeholder?: string
    options?: string[]
    required?: boolean
    validation?: {
      required?: boolean
      min?: number
      max?: number
    }
  }>
  message?: string
  action?: 'create' | 'modify' | 'delete' | 'reorder'
}

export class AIChatFormHandler {
  private extractFormName(request: string): string {
    // Try to extract form name from common patterns
    const patterns = [
      /create\s+(?:a\s+)?(?:form|survey)\s+(?:for|about)?\s*["']?([^"']+)["']?/i,
      /make\s+(?:a\s+)?(?:form|survey)\s+(?:for|about)?\s*["']?([^"']+)["']?/i,
      /generate\s+(?:a\s+)?(?:form|survey)\s+(?:for|about)?\s*["']?([^"']+)["']?/i,
      /form\s+(?:for|about)?\s*["']?([^"']+)["']?/i,
      /subscription\s+form/i,  // Add specific pattern for subscription form
      /([a-z\s]+)\s+form/i,   // Generic pattern for any type of form
    ]

    for (const pattern of patterns) {
      const match = request.match(pattern)
      if (match && match[1]) {
        // Clean up and format the form name
        const name = match[1]
          .trim()
          .replace(/^(for|about)\s+/i, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        
        return name.endsWith('Form') ? name : `${name} Form`
      }
    }

    // Check for subscription form specifically
    if (request.toLowerCase().includes('subscription')) {
      return 'Subscription Form'
    }

    // Default name if no pattern matches
    return 'Untitled Form'
  }

  private validateRequest(action: string, target: string): FormModificationRule | null {
    const rule = formAIRules.find(r => r.action === action && r.target === target)
    return rule || null
  }

  async handleFormRequest(
    request: string,
    currentElements: FormElement[],
    onUpdateForm: (action: FormAction) => void
  ): Promise<string> {
    try {
      const formName = this.extractFormName(request)
      console.log('Making API request with:', { request, currentElements, formName })

      // Ensure currentElements is always an array
      const safeCurrentElements = Array.isArray(currentElements) ? currentElements : []

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: request,
          currentForm: {
            formName: formName,
            fields: safeCurrentElements
          }
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`)
      }

      const aiResponse: AIResponse = await response.json()
      console.log('AI Response:', aiResponse)

      if (!aiResponse.fields || !Array.isArray(aiResponse.fields)) {
        throw new Error('Invalid response format: missing or invalid fields array')
      }

      // Ensure each field has required properties with defaults
      const formElements: FormElement[] = aiResponse.fields.map(field => ({
        id: field.id || `${field.type}-${uuidv4()}`,
        type: field.type,
        label: field.label || 'Untitled',
        placeholder: field.placeholder || '',
        options: Array.isArray(field.options) ? field.options : [],
        required: field.required ?? true,
        validation: field.validation || {
          required: true
        },
        value: '',
        size: 'normal'
      }))

      // Update form with validated elements
      onUpdateForm({
        type: 'UPDATE',
        elements: formElements,
        formName: aiResponse.formName || formName
      })

      return aiResponse.message || `Form "${aiResponse.formName}" updated successfully!`
    } catch (error) {
      console.error('Error in handleFormRequest:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to process form request')
    }
  }
} 