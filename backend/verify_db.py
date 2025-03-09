import os
import sys
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

# Get database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "login")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

def verify_database():
    """Verify the database connection and table structure."""
    try:
        # Connect to the MySQL server
        print(f"Connecting to MySQL database at {DB_HOST}:{DB_PORT} as {DB_USER}...")
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        
        print(f"Successfully connected to MySQL database: {DB_NAME}")
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Check if usercred table exists
            cursor.execute("SHOW TABLES LIKE 'usercred'")
            if not cursor.fetchone():
                print("Table 'usercred' does not exist in the database.")
                return
            
            # Get table structure
            cursor.execute("DESCRIBE usercred")
            columns = cursor.fetchall()
            
            print("\nTable structure for 'usercred':")
            for column in columns:
                print(f"- {column['Field']}: {column['Type']} (Null: {column['Null']}, Key: {column['Key']}, Default: {column['Default']}, Extra: {column['Extra']})")
            
            # Check password column length
            password_column = next((col for col in columns if col['Field'] == 'password'), None)
            if password_column:
                if 'varchar(255)' in password_column['Type'].lower():
                    print("\nPassword column has correct length (VARCHAR(255)).")
                else:
                    print(f"\nWARNING: Password column has unexpected type: {password_column['Type']}. Should be VARCHAR(255).")
            else:
                print("\nWARNING: Password column not found in table structure.")
            
            # Count users
            cursor.execute("SELECT COUNT(*) as count FROM usercred")
            user_count = cursor.fetchone()['count']
            print(f"\nTotal users in database: {user_count}")
            
            # List users (without passwords)
            if user_count > 0:
                cursor.execute("SELECT id, username, email, is_active, created_at, updated_at FROM usercred")
                users = cursor.fetchall()
                
                print("\nUsers in database:")
                for user in users:
                    print(f"- ID: {user['id']}, Username: {user['username']}, Email: {user['email']}, Active: {user['is_active']}")
        
        print("\nDatabase verification completed successfully!")
    
    except Exception as e:
        print(f"Error verifying database: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    print("Verifying database...")
    verify_database() 