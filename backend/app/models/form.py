# models.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from ..database import Base
from sqlalchemy import Column, String, DateTime, func, Integer, JSON, Text
from sqlalchemy.types import TypeDecorator
import json
from sqlalchemy.ext.declarative import declarative_base
import datetime

class JSONEncodedDict(TypeDecorator):
    """Represents a JSON-encoded structure as a Text column."""
    impl = Text
    
    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return None
        
    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return None

class FormField(BaseModel):
    id: str
    type: str
    label: str
    required: Optional[bool] = False
    placeholder: Optional[str] = None
    caption: Optional[str] = None
    options: Optional[List[str]] = None
    value: Optional[Union[str, List[str], bool]] = None

class FormCreate(BaseModel):
    form_name: str
    fields: List[dict]
    form_id: Optional[int] = None
    user_id: int

class Form(Base):
    __tablename__ = "forms"

    form_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    form_name = Column(String(255), nullable=False)
    form_data = Column(JSON)  # MySQL 5.7+ supports JSON type
    user_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

class FormUpdate(BaseModel):
    form_id: int
    form_name: str
    fields: List[FormField]
    user_id: int