import os
import sys
from dotenv import load_dotenv
import pymysql
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

# Get database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "login")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_usercred_table():
    """Initialize the usercred table in the MySQL database."""
    try:
        # Connect to the MySQL server
        print(f"Connecting to MySQL database at {DB_HOST}:{DB_PORT} as {DB_USER}...")
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        
        print(f"Successfully connected to MySQL server")
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Check if database exists
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            print(f"Database '{DB_NAME}' created or already exists")
            
            # Use the database
            cursor.execute(f"USE {DB_NAME}")
            
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'usercred'")
            table_exists = cursor.fetchone()
            
            if table_exists:
                # Alter the existing table to increase password column length
                print("Table 'usercred' exists, modifying password column length...")
                try:
                    cursor.execute("ALTER TABLE usercred MODIFY COLUMN password VARCHAR(255)")
                    connection.commit()
                    print("Password column length increased to VARCHAR(255)")
                except pymysql.Error as e:
                    print(f"Error modifying table: {e}")
            else:
                # Create usercred table if it doesn't exist
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS usercred (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """)
                print("Table 'usercred' created")
            
            # Check if we have any users
            cursor.execute("SELECT COUNT(*) FROM usercred")
            user_count = cursor.fetchone()[0]
            
            if user_count == 0:
                print("Creating default users...")
                
                # Create default users
                default_users = [
                    {
                        "username": "Shageetha",
                        "email": "shageetha@example.com",
                        "password": "Form@123"
                    },
                    {
                        "username": "admin",
                        "email": "admin@example.com",
                        "password": "admin123"
                    },
                    {
                        "username": "demo",
                        "email": "demo@example.com",
                        "password": "demo123"
                    }
                ]
                
                for user_data in default_users:
                    # Hash the password
                    hashed_password = get_password_hash(user_data["password"])
                    
                    # Create user
                    try:
                        cursor.execute(
                            "INSERT INTO usercred (username, email, password) VALUES (%s, %s, %s)",
                            (user_data["username"], user_data["email"], hashed_password)
                        )
                        connection.commit()
                        print(f"Created user: {user_data['username']}")
                    except pymysql.err.IntegrityError:
                        connection.rollback()
                        print(f"User {user_data['username']} already exists")
            else:
                print(f"Database already contains {user_count} users. Skipping initialization.")
        
        print("Database initialization completed successfully!")
    
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    print("Initializing the usercred table...")
    init_usercred_table() 