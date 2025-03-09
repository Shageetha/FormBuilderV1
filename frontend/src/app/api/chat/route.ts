import { OpenAI } from 'openai'
import { FormElement, FormElementType } from '@/types/form'
import { formAIRules } from '@/types/aiRules'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface FormResponse {
  formName: string
  fields: FormElement[]
  message?: string
  action?: 'create' | 'modify' | 'delete' | 'reorder'
}

export async function POST(req: Request) {
  try {
    const { message, currentForm, autoSave } = await req.json()
    console.log('Received request:', { message, currentForm, autoSave })
    let aiResponse = ''

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    // If it's an auto-save request, handle it differently
    if (autoSave) {
      try {
        // Simple validation and save
        if (!currentForm || !currentForm.fields) {
          throw new Error('Invalid form data for auto-save')
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Form auto-saved successfully',
          formName: currentForm.formName,
          fields: currentForm.fields,
          action: 'modify'
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (autoSaveError) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Failed to auto-save form',
          error: autoSaveError instanceof Error ? autoSaveError.message : 'Unknown error'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    const systemPrompt = `You are a form management AI assistant that generates JSON responses.
    ${currentForm 
      ? `Modify the existing form: ${JSON.stringify(currentForm, null, 2)}` 
      : 'Create a new form with appropriate fields based on the request.'}

    Important: Always return a complete JSON response with all fields.
    When modifying a form:
    - Include ALL existing fields in your response
    - Update the specified fields while keeping their IDs
    - Add any new fields with new IDs
    - Never return an empty fields array

    When creating a new form:
    - Generate appropriate fields based on the form type
    - Assign unique IDs to each field
    - Include all required properties

    Available field types and their exact names:
    - Basic Fields: 
      * "text" (for short text input)
      * "number" (IMPORTANT: for numeric input, must include validation)
      * "email" (for email addresses)
      * "tel" (for phone numbers)
    - Text Fields:
      * "textarea" (for multi-line input)
    - Choice Fields:
      * "select" (for dropdown menus)
      * "checkbox" (for multiple selections)
      * "radio" (for radio buttons)
    - Date & Time:
      * "date" (for dates)
      * "time" (for time)
      * "datetime-local" (for both)
    - Range Fields:
      * "range" (for sliders)

    Return your response in this JSON format:
    {
      "formName": "${currentForm?.formName || 'New Form'}",
      "action": "${currentForm ? 'modify' : 'create'}",
      "fields": [
        {
          "id": "field-1",
          "type": "text",  // Use exact HTML input types from above
          "label": "Label",
          "placeholder": "Enter value",
          "required": true,
          "options": ["Option 1", "Option 2"],  // For select, radio, checkbox fields
          "validation": {
            "required": true,
            "min": 0,            
            "max": 100           
          }
        }
      ]
    }

    IMPORTANT - For number fields, you must use this exact format:
    {
      "id": "field-X",
      "type": "number",
      "label": "Number Field",
      "placeholder": "Enter a number",
      "required": true,
      "validation": {
        "required": true,
        "min": 0,
        "max": 999999
      }
    }

    All number fields MUST include the validation object with min and max values.`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `${currentForm ? 'Modify' : 'Create'} the form: ${message}. Return a complete JSON response with all fields.`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      })

      aiResponse = completion.choices[0].message?.content ?? ''
      console.log('AI Response:', aiResponse)
      const formData: FormResponse = JSON.parse(aiResponse)
      
      // Initialize with current form fields if available
      if (currentForm?.fields) {
        formData.fields = [...currentForm.fields]
      }

      // Ensure we have fields
      if (!formData.fields || !Array.isArray(formData.fields)) {
        formData.fields = [
          {
            id: "field-1",
            type: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true
          },
          {
            id: "field-2",
            type: "email",
            label: "Email",
            placeholder: "Enter your email",
            required: true
          }
        ]
      }

      // Handle modifications if we have a message
      if (message && message.trim() !== '') {
        try {
          const completion2 = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { 
                role: "user", 
                content: `Current form has these fields: ${JSON.stringify(formData.fields)}. 
                         Modify the form with this request: ${message}. 
                         Return a complete JSON response including ALL existing fields plus any modifications.`
              }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          })

          const modifiedResponse = JSON.parse(completion2.choices[0].message?.content ?? '')
          if (modifiedResponse.fields && modifiedResponse.fields.length > 0) {
            formData.fields = modifiedResponse.fields
          }
        } catch (error) {
          console.error('Modification error:', error)
        }
      }

      // Final validation to ensure we never return empty fields
      if (formData.fields.length === 0) {
        formData.fields = currentForm?.fields || [
          {
            id: "field-1",
            type: "text",
            label: "Default Field",
            placeholder: "Enter value",
            required: true
          }
        ]
      }

      // Add field type normalization
      if (formData?.fields) {
        formData.fields = formData.fields.map(field => {
          let updatedField = { ...field }
          
          // Convert non-standard types to HTML standard types
          const typeMapping: { [key: string]: string } = {
            'short-answer': 'text',
            'phone-number': 'tel',
            'multiple-choice': 'radio',
            'dropdown': 'select',
            'date-picker': 'date',
            'time-picker': 'time',
            'date-time-picker': 'datetime-local',
            'star-rating': 'range',
            'slider': 'range'
          }

          if (field.type in typeMapping) {
            updatedField.type = typeMapping[field.type] as FormElementType
          }
          
          // Ensure number fields have proper structure
          if (field.type === 'number') {
            updatedField = {
              ...field,
              type: 'number' as FormElementType,
              placeholder: field.placeholder || 'Enter a number',
              required: true,
              validation: {
                required: true,
                min: 0,
                max: 999999
              }
            }
          }

          // Ensure all fields have required properties
          updatedField.required = updatedField.required ?? true
          updatedField.placeholder = updatedField.placeholder || `Enter ${updatedField.label}`
          
          return updatedField
        })
      }

      const responseMessage = formData.action === 'modify'
        ? `Successfully modified form: ${formData.formName}. Changes applied to ${formData.fields.length} fields.`
        : `Successfully created form: ${formData.formName} with ${formData.fields.length} fields.`

     

      return new Response(JSON.stringify({
        formName: formData.formName,
        fields: formData.fields,
        action: formData.action,
        message: responseMessage,
        success: true,
        lastSaved: new Date().toISOString()
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'X-Auto-Save-Enabled': 'true',
          'X-Last-Saved': new Date().toISOString()
        }
      })

    } catch (parseError) {
      console.error('Parse error details:', {
        error: parseError,
        aiResponse,
        requestData: { message, currentForm }
      })
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to process form request',
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        debug: { aiResponse }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Fatal error details:', {
      error,
      stack: error instanceof Error ? error.stack : undefined
    })
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to process request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
