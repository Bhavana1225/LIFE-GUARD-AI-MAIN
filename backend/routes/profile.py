from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import sqlite3

router = APIRouter(prefix="/profile", tags=["Health Profile"])

DATABASE = "lifeguard.db"


class HealthProfile(BaseModel):
    user_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    smoking: Optional[str] = None
    alcohol: Optional[str] = None
    physical_activity: Optional[str] = None
    medical_history: Optional[str] = None
    family_history: Optional[str] = None
    blood_pressure: Optional[float] = None
    blood_sugar: Optional[float] = None
    cholesterol: Optional[float] = None


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_table():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS health_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            age INTEGER,
            gender TEXT,
            height REAL,
            weight REAL,
            smoking TEXT,
            alcohol TEXT,
            physical_activity TEXT,
            medical_history TEXT,
            family_history TEXT,
            blood_pressure REAL,
            blood_sugar REAL,
            cholesterol REAL,
            updated_at TEXT
        )
    """)

    connection.commit()
    connection.close()


create_table()


@router.post("/")
def save_profile(profile: HealthProfile):
    connection = get_connection()

    connection.execute("""
        INSERT INTO health_profiles (
            user_id,
            age,
            gender,
            height,
            weight,
            smoking,
            alcohol,
            physical_activity,
            medical_history,
            family_history,
            blood_pressure,
            blood_sugar,
            cholesterol,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id)
        DO UPDATE SET
            age = excluded.age,
            gender = excluded.gender,
            height = excluded.height,
            weight = excluded.weight,
            smoking = excluded.smoking,
            alcohol = excluded.alcohol,
            physical_activity = excluded.physical_activity,
            medical_history = excluded.medical_history,
            family_history = excluded.family_history,
            blood_pressure = excluded.blood_pressure,
            blood_sugar = excluded.blood_sugar,
            cholesterol = excluded.cholesterol,
            updated_at = excluded.updated_at
    """, (
        profile.user_id,
        profile.age,
        profile.gender,
        profile.height,
        profile.weight,
        profile.smoking,
        profile.alcohol,
        profile.physical_activity,
        profile.medical_history,
        profile.family_history,
        profile.blood_pressure,
        profile.blood_sugar,
        profile.cholesterol,
        datetime.now().isoformat()
    ))

    connection.commit()
    connection.close()

    return {
        "success": True,
        "message": "Health profile saved successfully"
    }


@router.get("/{user_id}")
def get_profile(user_id: str):
    connection = get_connection()

    profile = connection.execute(
        "SELECT * FROM health_profiles WHERE user_id = ?",
        (user_id,)
    ).fetchone()

    connection.close()

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Health profile not found"
        )

    return dict(profile)