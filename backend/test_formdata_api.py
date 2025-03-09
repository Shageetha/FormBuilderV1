import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API URL
API_URL = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000")

# Sample form data
sample_form_data = {
    "form_id": 1,
    "form_name": "My Form",
    "form_description": "This is a test form",
    "form_elements": [
        {
            "id": "email-1741520331977",
            "type": "email",
            "label": "Email Address",
            "placeholder": "Enter email address",
            "options": [],
            "required": False,
            "validation": {"required": False},
            "value": "",
            "size": "normal"
        },
        {
            "id": "url_1741520336163",
            "type": "url",
            "label": "Url Field",
            "placeholder": "Enter website URL",
            "options": [],
            "required": False,
            "validation": {"required": True},
            "value": "",
            "size": "normal"
        }
    ],
    "form_theme": {
        "primaryColor": "#3B82F6",
        "backgroundColor": "#FFFFFF",
        "textColor": "#1F2937",
        "borderRadius": "0.375rem",
        "fontFamily": "Inter, sans-serif",
        "layout": "default",
        "style": "flat"
    },
    "user_id": 1
}

def test_create_form_data():
    """Test creating form data"""
    print("\n=== Testing Create Form Data ===")
    
    try:
        response = requests.post(
            f"{API_URL}/api/formdata/formdata",
            json=sample_form_data
        )
        
        if response.status_code == 201:
            print("✅ Form data created successfully!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response.json()
        else:
            print(f"❌ Failed to create form data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_get_form_data(form_id):
    """Test getting form data by ID"""
    print("\n=== Testing Get Form Data ===")
    
    try:
        response = requests.get(f"{API_URL}/api/formdata/formdata/{form_id}")
        
        if response.status_code == 200:
            print(f"✅ Form data retrieved successfully for ID {form_id}!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response.json()
        else:
            print(f"❌ Failed to get form data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_get_user_form_data(user_id):
    """Test getting all form data for a user"""
    print(f"\n=== Testing Get User Form Data for User {user_id} ===")
    
    try:
        response = requests.get(f"{API_URL}/api/formdata/formdata/user/{user_id}")
        
        if response.status_code == 200:
            print(f"✅ Form data retrieved successfully for user {user_id}!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response.json()
        else:
            print(f"❌ Failed to get user form data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_update_form_data(form_data_id):
    """Test updating form data"""
    print(f"\n=== Testing Update Form Data for ID {form_data_id} ===")
    
    # Update the sample data
    updated_data = sample_form_data.copy()
    updated_data["form_name"] = "Updated Form Name"
    updated_data["form_description"] = "This form has been updated"
    
    try:
        response = requests.put(
            f"{API_URL}/api/formdata/formdata/{form_data_id}",
            json=updated_data
        )
        
        if response.status_code == 200:
            print(f"✅ Form data updated successfully for ID {form_data_id}!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response.json()
        else:
            print(f"❌ Failed to update form data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_delete_form_data(form_data_id):
    """Test deleting form data"""
    print(f"\n=== Testing Delete Form Data for ID {form_data_id} ===")
    
    try:
        response = requests.delete(f"{API_URL}/api/formdata/formdata/{form_data_id}")
        
        if response.status_code == 204:
            print(f"✅ Form data deleted successfully for ID {form_data_id}!")
            return True
        else:
            print(f"❌ Failed to delete form data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Run tests
    created_data = test_create_form_data()
    
    if created_data:
        form_data_id = created_data["id"]
        
        # Test getting form data
        test_get_form_data(created_data["form_id"])
        
        # Test getting user form data
        test_get_user_form_data(created_data["user_id"])
        
        # Test updating form data
        test_update_form_data(form_data_id)
        
        # Test deleting form data
        # Uncomment to test deletion
        # test_delete_form_data(form_data_id) 