from sqlalchemy import Column, Integer, String, Text, DateTime, func, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
import json

class FormData(Base):
    """
    Model for storing form data including elements, theme, and description.
    This model is designed to store data from session storage.
    """
    __tablename__ = "formdata"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    form_id = Column(Integer, nullable=False, index=True)
    form_name = Column(String(255), nullable=False)
    form_description = Column(Text, nullable=True)
    form_elements = Column(JSON, nullable=False)  # Stores the form elements as JSON
    form_theme = Column(JSON, nullable=True)  # Stores the theme settings as JSON
    user_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    def __repr__(self):
        return f"<FormData(id={self.id}, form_id={self.form_id}, form_name='{self.form_name}')>" 