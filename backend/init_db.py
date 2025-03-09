import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from app.models.form import Base

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set in environment variables")

# Create engine
engine = create_engine(DATABASE_URL)

def init_db():
    """Initialize the database by creating all tables."""
    try:
        # Create all tables defined in the models
        Base.metadata.create_all(engine)
        print("Database tables created successfully.")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"Database connection test: {result.scalar()}")
            
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    print(f"Initializing database using URL: {DATABASE_URL}")
    init_db() 