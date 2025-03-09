from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Format: postgresql://username:password@host:port/database
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    # Create engine with proper settings
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_pre_ping=True
    )
    
    # Test connection
    with engine.connect() as connection:
        print("Database connection successful!")

except SQLAlchemyError as e:
    print(f"Database connection failed: {str(e)}") 