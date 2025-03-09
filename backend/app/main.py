from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import forms, auth, query, auth_db, formdata

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(forms.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth")
app.include_router(auth_db.router, prefix="/api/auth_db")
app.include_router(query.router, prefix="/api/query")
app.include_router(formdata.router, prefix="/api/formdata")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Form Builder API"}