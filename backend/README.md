# Form Builder Backend

This is the backend API for the Form Builder application, built with FastAPI and MySQL.

## Prerequisites

- Python 3.8+
- MySQL Server
- pip (Python package manager)

## Setup

1. **Clone the repository**

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up MySQL database**
   - Create a MySQL database named `form_builder`
   - Update the `.env` file with your MySQL credentials

6. **Initialize the database**
   ```bash
   python -m app.init_db
   ```

## Running the Server

```bash
python run.py
```

The server will start at `http://localhost:8000`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/token` - Get a token with username and password

### Forms

- `GET /api/forms` - Get all forms
- `POST /api/forms` - Create a new form
- `GET /api/forms/{form_id}` - Get a specific form
- `PUT /api/forms/{form_id}` - Update a form
- `DELETE /api/forms/{form_id}` - Delete a form

## Default Users

The system comes with three default users:

1. **Username:** Shageetha  
   **Password:** Form@123

2. **Username:** admin  
   **Password:** admin123

3. **Username:** demo  
   **Password:** demo123 