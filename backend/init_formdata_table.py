import os
import sys
import pymysql
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import urllib.parse

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
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

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

def create_formdata_table():
    """Create the formdata table if it doesn't exist."""
    try:
        with engine.connect() as connection:
            # Check if table exists
            result = connection.execute(text(
                "SELECT COUNT(*) FROM information_schema.tables "
                "WHERE table_schema = :db_name AND table_name = 'formdata'"
            ), {"db_name": DB_NAME})
            
            if result.scalar() == 0:
                # Create the table
                connection.execute(text("""
                CREATE TABLE formdata (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    form_id INT NOT NULL,
                    form_name VARCHAR(255) NOT NULL,
                    form_description TEXT,
                    form_elements JSON NOT NULL,
                    form_theme JSON,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
                    INDEX (form_id),
                    INDEX (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """))
                print("✅ formdata table created successfully!")
            else:
                print("ℹ️ formdata table already exists.")
                
            # Verify the table structure
            print("\nTable structure:")
            result = connection.execute(text("DESCRIBE formdata"))
            for row in result:
                print(f"  {row[0]}: {row[1]}")
                
    except Exception as e:
        print(f"❌ Error creating formdata table: {str(e)}")
        raise

if __name__ == "__main__":
    create_formdata_table() 