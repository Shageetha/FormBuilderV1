from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any, Union
from ..database import get_db
from ..models.formdata import FormData
import json
from datetime import datetime

router = APIRouter()

# Pydantic models for request/response
class FormTheme(BaseModel):
    primaryColor: str
    backgroundColor: str
    textColor: str
    borderRadius: str
    fontFamily: str
    layout: str
    style: str

class FormElement(BaseModel):
    id: str
    type: str
    label: str
    placeholder: Optional[str] = None
    options: Optional[List[str]] = []
    required: Optional[bool] = False
    validation: Optional[Dict[str, Any]] = None
    value: Optional[str] = ""
    size: Optional[str] = "normal"

class FormDataCreate(BaseModel):
    form_id: int
    form_name: str
    form_description: Optional[str] = None
    form_elements: List[FormElement]
    form_theme: Optional[FormTheme] = None
    user_id: int

class FormDataResponse(BaseModel):
    id: int
    form_id: int
    form_name: str
    form_description: Optional[str] = None
    form_elements: List[Dict[str, Any]]
    form_theme: Optional[Dict[str, Any]] = None
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

@router.post("/formdata", response_model=FormDataResponse, status_code=status.HTTP_201_CREATED)
async def create_form_data(form_data: FormDataCreate, db: Session = Depends(get_db)):
    """
    Create a new form data entry from session storage data.
    """
    try:
        # Convert Pydantic models to dictionaries for JSON storage
        form_elements_json = [element.dict() for element in form_data.form_elements]
        form_theme_json = form_data.form_theme.dict() if form_data.form_theme else None
        
        # Create new FormData object
        db_form_data = FormData(
            form_id=form_data.form_id,
            form_name=form_data.form_name,
            form_description=form_data.form_description,
            form_elements=form_elements_json,
            form_theme=form_theme_json,
            user_id=form_data.user_id
        )
        
        # Add to database
        db.add(db_form_data)
        db.commit()
        db.refresh(db_form_data)
        
        return db_form_data
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@router.get("/formdata/{form_id}", response_model=FormDataResponse)
async def get_form_data(form_id: int, db: Session = Depends(get_db)):
    """
    Get form data by form ID.
    """
    # Get the latest form data for the given form_id
    form_data = db.query(FormData).filter(FormData.form_id == form_id).order_by(FormData.created_at.desc()).first()
    
    if not form_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form data with ID {form_id} not found"
        )
    
    return form_data

@router.get("/formdata/user/{user_id}", response_model=List[FormDataResponse])
async def get_user_form_data(user_id: int, db: Session = Depends(get_db)):
    """
    Get all form data for a specific user.
    """
    form_data = db.query(FormData).filter(FormData.user_id == user_id).all()
    
    if not form_data:
        return []
    
    return form_data

@router.put("/formdata/{id}", response_model=FormDataResponse)
async def update_form_data(id: int, form_data: FormDataCreate, db: Session = Depends(get_db)):
    """
    Update existing form data.
    """
    db_form_data = db.query(FormData).filter(FormData.id == id).first()
    
    if not db_form_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form data with ID {id} not found"
        )
    
    try:
        # Convert Pydantic models to dictionaries for JSON storage
        form_elements_json = [element.dict() for element in form_data.form_elements]
        form_theme_json = form_data.form_theme.dict() if form_data.form_theme else None
        
        # Update fields
        db_form_data.form_name = form_data.form_name
        db_form_data.form_description = form_data.form_description
        db_form_data.form_elements = form_elements_json
        db_form_data.form_theme = form_theme_json
        
        # Commit changes
        db.commit()
        db.refresh(db_form_data)
        
        return db_form_data
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@router.delete("/formdata/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_form_data(id: int, db: Session = Depends(get_db)):
    """
    Delete form data by ID.
    """
    db_form_data = db.query(FormData).filter(FormData.id == id).first()
    
    if not db_form_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Form data with ID {id} not found"
        )
    
    try:
        db.delete(db_form_data)
        db.commit()
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        ) 