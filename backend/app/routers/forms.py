from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, validator
from ..database import SessionLocal
from ..models.form import Form
import json
from sqlalchemy import func
import uuid
from datetime import datetime

router = APIRouter()

# Add this dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FormFieldBase(BaseModel):
    id: str
    type: str
    label: str
    required: Optional[bool] = False
    placeholder: Optional[str] = None
    caption: Optional[str] = None
    options: Optional[List[str]] = []
    value: Optional[Union[str, List[str], bool]] = None

class FormCreateRequest(BaseModel):
    form_name: str
    fields: List[FormFieldBase]
    user_id: int
    updated_at: Optional[str] = None
    created_at: Optional[str] = None

    @validator('fields')
    def validate_fields(cls, fields):
        if not fields:
            raise ValueError('At least one form field is required')
        return fields

    @validator('form_name')
    def validate_form_name(cls, v):
        if not v or not v.strip():
            return 'Untitled Form'
        return v.strip()

class FormUpdateRequest(BaseModel):
    form_id: int
    form_name: str
    fields: List[FormFieldBase]
    user_id: int
    updated_at: str

    @validator('form_name')
    def validate_form_name(cls, v):
        if not v or not v.strip():
            return 'Untitled Form'
        return v.strip()

@router.post("/forms/auto-save", status_code=status.HTTP_201_CREATED)
async def auto_save_form(form_data: FormCreateRequest, db: Session = Depends(get_db)):
    try:
        # Convert fields to dict for storage
        form_fields = [field.dict(exclude_unset=True) for field in form_data.fields]

        # Create new form
        db_form = Form(
            form_name=form_data.form_name,
            form_data=form_fields,
            user_id=form_data.user_id,
            updated_at=datetime.utcnow()
        )

        try:
            db.add(db_form)
            db.commit()
            db.refresh(db_form)
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while saving form: {str(e)}"
            )

        return {
            "message": "Form saved successfully",
            "form_id": db_form.form_id,
            "form_name": db_form.form_name,
            "user_id": db_form.user_id,
            "fields": db_form.form_data,
            "updated_at": db_form.updated_at.isoformat() if db_form.updated_at else None
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving form: {str(e)}"
        )

@router.get("/forms/get-data")
async def get_form_data(db: Session = Depends(get_db)):
    try:
        forms = db.query(Form).all()
        return forms
    except Exception as e:
        print(f"Error fetching form data: {e}")
        db.rollback()  # Rollback the transaction
        raise HTTPException(status_code=500, detail="Error fetching form data from the database")
    finally:
        db.close()  # Close the database connection

@router.put("/forms/update", response_model=None)
async def update_form(form_update: FormUpdateRequest, db: Session = Depends(get_db)):
    try:
        db_form = db.query(Form).filter(Form.form_id == form_update.form_id).first()
        if not db_form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID {form_update.form_id} not found"
            )

        if db_form.user_id != form_update.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this form"
            )

        # Convert fields to dict for storage
        form_fields = [field.dict(exclude_unset=True) for field in form_update.fields]

        # Update form fields
        db_form.form_name = form_update.form_name
        db_form.form_data = form_fields
        db_form.updated_at = datetime.utcnow()

        try:
            db.commit()
            db.refresh(db_form)
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error while updating form: {str(e)}"
            )

        return {
            "message": "Form updated successfully",
            "form_id": db_form.form_id,
            "form_name": db_form.form_name,
            "user_id": db_form.user_id,
            "updated_at": db_form.updated_at.isoformat() if db_form.updated_at else None,
            "fields": db_form.form_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating form: {str(e)}"
        )

@router.get("/forms/{form_id}")
async def get_form_by_id(form_id: int, db: Session = Depends(get_db)):
    try:
        form = db.query(Form).filter(Form.form_id == form_id).first()
        if not form:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Form with ID {form_id} not found"
            )
        
        return {
            "form_id": form.form_id,
            "form_name": form.form_name,
            "fields": form.form_data,
            "user_id": form.user_id,
            "updated_at": form.updated_at.isoformat() if form.updated_at else None
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching form: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching form: {str(e)}"
        )
    finally:
        db.close()