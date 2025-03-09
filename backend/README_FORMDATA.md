# Form Data Storage Implementation

This document describes the implementation of form data storage from session storage to the MySQL database.

## Overview

The implementation allows form data from the frontend's session storage to be saved to the database. This includes:

- Form elements (fields, their types, properties, etc.)
- Form theme settings
- Form description
- User information

## Database Schema

A new table `formdata` has been created with the following structure:

```sql
CREATE TABLE formdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    form_name VARCHAR(255) NOT NULL,
    form_description TEXT,
    form_elements JSON NOT NULL,
    form_theme JSON,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX (form_id),
    INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backend Implementation

### Models

- `formdata.py`: Defines the SQLAlchemy model for the form data table.

### API Endpoints

The following API endpoints have been implemented:

- `POST /api/formdata/formdata`: Create a new form data entry
- `GET /api/formdata/formdata/{form_id}`: Get form data by form ID
- `GET /api/formdata/formdata/user/{user_id}`: Get all form data for a user
- `PUT /api/formdata/formdata/{id}`: Update existing form data
- `DELETE /api/formdata/formdata/{id}`: Delete form data

### Setup Scripts

- `init_formdata_table.py`: Script to initialize the formdata table in the database.
- `test_formdata_api.py`: Script to test the formdata API endpoints.

## Frontend Implementation

### Services

- `formdata-service.ts`: Service to interact with the formdata API endpoints.

### Utilities

- `sessionStorage.ts`: Utility functions for session storage operations.

### Integration

The following components have been updated to use the session storage and API services:

- `FormBuilder.tsx`: Updated to save form data to session storage and publish to the database.
- `ThemeTab.tsx`: Updated to save theme changes to session storage.

## How to Use

### Setup

1. Run the initialization script to create the formdata table:

```bash
python init_formdata_table.py
```

2. Start the backend server:

```bash
python run_server.py
```

3. Start the frontend development server:

```bash
cd frontend
npm run dev
```

### Testing

You can test the API endpoints using the test script:

```bash
python test_formdata_api.py
```

## Session Storage Structure

The following items are stored in session storage:

- `currentFormId`: The ID of the current form
- `currentFormName`: The name of the current form
- `currentFormDescription`: The description of the current form
- `currentFormElements`: The form elements as a JSON string
- `currentFormTheme`: The form theme settings as a JSON string
- `userId`: The ID of the current user

## Flow

1. User creates or edits a form in the Form Builder
2. Form data is automatically saved to session storage
3. When the user clicks "Publish", the form data is sent to the backend API
4. The backend saves the form data to the database
5. The form can be retrieved later using the form ID or user ID 