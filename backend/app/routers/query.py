from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import pymysql
import os
from dotenv import load_dotenv
import urllib.parse

# Load environment variables
load_dotenv()

# Get database configuration from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "login")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

router = APIRouter(tags=["Query"])

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

@router.get("/usercred", response_model=List[Dict[str, Any]])
async def get_user_credentials():
    """
    Retrieve all records from the usercred table in the login database.
    """
    connection = None
    try:
        connection = get_connection()
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Check if the usercred table exists
            cursor.execute("SHOW TABLES LIKE 'usercred'")
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Table 'usercred' does not exist in the database")
            
            # Execute the query
            cursor.execute("SELECT * FROM usercred")
            
            # Fetch all rows
            rows = cursor.fetchall()
            
            if not rows:
                return []
            
            return list(rows)
    
    except pymysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection and connection.open:
            connection.close()

@router.get("/usercred/columns")
async def get_usercred_columns():
    """
    Retrieve the column names from the usercred table.
    """
    connection = None
    try:
        connection = get_connection()
        
        # Create a cursor
        with connection.cursor() as cursor:
            # Check if the usercred table exists
            cursor.execute("SHOW TABLES LIKE 'usercred'")
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Table 'usercred' does not exist in the database")
            
            # Get column information
            cursor.execute("DESCRIBE usercred")
            columns = [
                {
                    "name": column[0],
                    "type": column[1],
                    "null": column[2],
                    "key": column[3],
                    "default": column[4],
                    "extra": column[5]
                }
                for column in cursor.fetchall()
            ]
            
            return {"columns": columns}
    
    except pymysql.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if connection and connection.open:
            connection.close() 