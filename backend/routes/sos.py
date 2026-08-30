from fastapi import APIRouter
from typing import List
from pydantic import BaseModel


router = APIRouter()


# Emergency contact model
class EmergencyContact(BaseModel):
    name: str
    phone: str


# SOS request model
class SOSRequest(BaseModel):
    contacts: List[EmergencyContact]
    message: str | None = None
    location: str | None = None



# Trigger SOS
@router.post("/sos")
def trigger_sos(data: SOSRequest):

    print("🚨 EMERGENCY SOS")
    print("Contacts:", data.contacts)
    print("Message:", data.message)
    print("Location:", data.location)

    return {
        "id": "SOS-12345",
        "eta": "Immediate",
        "notified": [
            contact.name for contact in data.contacts
        ]
    }



# Doctors list
@router.get("/doctors")
def get_doctors():

    return [
        {
            "id": 1,
            "name": "Dr. Arun Kumar",
            "specialty": "General Physician",
            "availability": "Available now",
            "phone": "9876543210"
        },
        {
            "id": 2,
            "name": "Dr. Priya Sharma",
            "specialty": "Emergency Care",
            "availability": "Available now",
            "phone": "9876543211"
        },
        {
            "id": 3,
            "name": "Dr. Rahul Verma",
            "specialty": "Cardiologist",
            "availability": "Available in 10 minutes",
            "phone": "9876543212"
        }
    ]