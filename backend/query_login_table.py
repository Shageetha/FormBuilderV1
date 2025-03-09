import os
import sys
from dotenv import load_dotenv
import pymysql
from tabulate import tabulate

# Load environment variables
load_dotenv()

# Get database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "login")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

def query_login_table():
    """Query the login.usercred table and display the results in a formatted table."""
    try:
        # Connect to the MySQL server
        print(f"Connecting to MySQL database at {DB_HOST}:{DB_PORT} as {DB_USER}...")
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME
        )
        
        print(f"Successfully connected to MySQL database: {DB_NAME}")
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Check if the usercred table exists
            cursor.execute("SHOW TABLES LIKE 'usercred'")
            if not cursor.fetchone():
                print("Table 'usercred' does not exist in the database.")
                
                # List all tables in the database
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                if tables:
                    print("\nAvailable tables in the database:")
                    for table in tables:
                        print(f"- {table[0]}")
                    
                    # Ask if user wants to query a different table
                    table_name = input("\nEnter a table name to query (or press Enter to exit): ")
                    if not table_name:
                        return
                    
                    # Get column names for the selected table
                    cursor.execute(f"DESCRIBE {table_name}")
                    columns = [column[0] for column in cursor.fetchall()]
                    
                    # Execute the query
                    cursor.execute(f"SELECT * FROM {table_name}")
                    
                    # Fetch all rows
                    rows = cursor.fetchall()
                    
                    if not rows:
                        print(f"No records found in the {table_name} table.")
                        return
                    
                    # Print the results in a table format
                    print(f"\nRecords from {table_name}:")
                    print(tabulate(rows, headers=columns, tablefmt="grid"))
                    
                    # Print the total number of records
                    print(f"\nTotal records: {len(rows)}")
                else:
                    print("No tables found in the database.")
                return
            
            # Get column names
            cursor.execute("DESCRIBE usercred")
            columns = [column[0] for column in cursor.fetchall()]
            
            # Execute the query
            cursor.execute("SELECT * FROM usercred")
            
            # Fetch all rows
            rows = cursor.fetchall()
            
            if not rows:
                print("No records found in the usercred table.")
                return
            
            # Print the results in a table format
            print("\nUser Credentials from login.usercred:")
            print(tabulate(rows, headers=columns, tablefmt="grid"))
            
            # Print the total number of records
            print(f"\nTotal records: {len(rows)}")
    
    except Exception as e:
        print(f"Error connecting to MySQL or querying data: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    print("Querying login.usercred table...")
    query_login_table() 