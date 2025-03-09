from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..database import Base
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCred(Base):
    __tablename__ = "usercred"

    UserId = Column(Integer, primary_key=True, index=True)
    Username = Column(String(45), nullable=False)
    Email = Column(String(45), nullable=False)
    password = Column(String(255), nullable=True)
    Confirm_Password = Column("Confirm Password", String(45), nullable=False)
    CreatedDate = Column(DateTime(6), nullable=True)

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password) 