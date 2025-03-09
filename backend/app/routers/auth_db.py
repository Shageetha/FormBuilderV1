from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
import pymysql
import os
from dotenv import load_dotenv
import urllib.parse
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import traceback

# Load environment variables
load_dotenv()

# Get database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "login")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key_change_this_in_production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(tags=["Authentication DB"])

# Pydantic models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=45)
    email: EmailStr
    password: str = Field(..., min_length=6)

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str  # Changed to string to support format "001"
    username: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

def get_connection():
    """Create and return a database connection."""
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except pymysql.Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"Error hashing password: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error hashing password: {str(e)}")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_sequential_id(connection):
    """Generate a sequential ID in the format '001', '002', etc."""
    try:
        with connection.cursor() as cursor:
            # Get the highest UserId
            cursor.execute("SELECT MAX(CAST(UserId AS UNSIGNED)) as max_id FROM usercred")
            result = cursor.fetchone()
            
            # If no users exist, start with 1
            next_id = 1
            if result and result['max_id'] is not None:
                next_id = int(result['max_id']) + 1
            
            # Format as '001', '002', etc.
            formatted_id = f"{next_id:03d}"
            return formatted_id
    except Exception as e:
        print(f"Error generating sequential ID: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating user ID: {str(e)}")

@router.post("/register")
async def register_user(user_data: UserCreate = Body(...)):
    """
    Register a new user in the usercred table.
    """
    connection = None
    try:
        connection = get_connection()
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Check if username already exists
            cursor.execute("SELECT * FROM usercred WHERE Username = %s", (user_data.username,))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already registered"
                )
            
            # Check if email already exists
            cursor.execute("SELECT * FROM usercred WHERE Email = %s", (user_data.email,))
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            try:
                # Generate sequential ID
                user_id = generate_sequential_id(connection)
                
                # Hash the password
                hashed_password = get_password_hash(user_data.password)
                
                # Get current datetime
                now = datetime.now()
                
                # Insert new user
                cursor.execute(
                    "INSERT INTO usercred (UserId, Username, Email, password, `Confirm Password`, CreatedDate) VALUES (%s, %s, %s, %s, %s, %s)",
                    (user_id, user_data.username, user_data.email, hashed_password, user_data.password, now)
                )
                connection.commit()
            except Exception as e:
                connection.rollback()
                print(f"Error during user creation: {e}")
                traceback.print_exc()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Registration error: {str(e)}"
                )
            
            # Get the newly created user
            cursor.execute("SELECT * FROM usercred WHERE Username = %s", (user_data.username,))
            user = cursor.fetchone()
            
            # Remove password from response
            if user and "password" in user:
                del user["password"]
            if user and "Confirm Password" in user:
                del user["Confirm Password"]
            
            # Map database column names to expected response format
            user_response = {
                "id": user["UserId"],
                "username": user["Username"],
                "email": user["Email"],
                "created_at": user["CreatedDate"]
            }
            
            return {
                "status": "success",
                "message": "User registered successfully. Please log in with your credentials.",
                "user": user_response
            }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error during registration: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")
    finally:
        if connection and connection.open:
            connection.close()

@router.post("/login")
async def login_user(user_data: UserLogin = Body(...)):
    """
    Authenticate a user and return a JWT token.
    """
    connection = None
    try:
        connection = get_connection()
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Find user by username
            cursor.execute("SELECT * FROM usercred WHERE Username = %s", (user_data.username,))
            user = cursor.fetchone()
            
            # Verify user exists and password is correct
            if not user or not verify_password(user_data.password, user["password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password"
                )
            
            # Create access token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user["UserId"])},
                expires_delta=access_token_expires
            )
            
            # Remove password from response
            if "password" in user:
                del user["password"]
            if "Confirm Password" in user:
                del user["Confirm Password"]
            
            # Map database column names to expected response format
            user_response = {
                "id": user["UserId"],
                "username": user["Username"],
                "email": user["Email"],
                "created_at": user["CreatedDate"]
            }
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_response
            }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error during login: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")
    finally:
        if connection and connection.open:
            connection.close()

@router.post("/token")
async def login_with_credentials(username: str = Body(...), password: str = Body(...)):
    """
    Authenticate a user with username and password and return a JWT token.
    """
    user_data = UserLogin(username=username, password=password)
    return await login_user(user_data) 