"use client"

import React from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import FormBuilder from '@/components/forms/FormBuilder'

export default function BuilderPage() {
  return (
    <ProtectedRoute>
      <FormBuilder formId={1} formName="My Form" formData="" />
    </ProtectedRoute>
  )
} 