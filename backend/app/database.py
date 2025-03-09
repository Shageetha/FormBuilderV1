import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
import pymysql
import urllib.parse

# Load environment variables from .env
load_dotenv()

# MySQL connection configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "login")
DB_PORT = os.getenv("DB_PORT", "3306")

# Escape the password for URL
escaped_password = urllib.parse.quote_plus(DB_PASSWORD) if DB_PASSWORD else ""

# Construct MySQL connection string
if escaped_password:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{escaped_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"Connecting to database: {DB_HOST}:{DB_PORT}/{DB_NAME} as {DB_USER}")

# Create engine with proper connection settings for MySQL
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,  # Helps detect and recover from stale connections
)

# SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Dependency to get SQLAlchemy DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to test database connection
def test_db_connection():
    try:
        # Create a connection
        with engine.connect() as connection:
            # Execute a simple query
            result = connection.execute(text("SELECT 1"))
            # Fetch the result
            result_value = result.scalar()
            # Check if the result is 1
            if result_value == 1:
                return {"status": "success", "message": "Database connection successful"}
            else:
                return {"status": "error", "message": "Database connection test failed"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection error: {str(e)}"}

# Run the test
if __name__ == "__main__":
    test_db_connection()
