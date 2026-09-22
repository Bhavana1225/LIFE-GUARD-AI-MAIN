from fastapi import APIRouter
from pydantic import BaseModel
import joblib

router = APIRouter()

# Load Diabetes Model
diabetes_model = joblib.load("models/diabetes_model.pkl")


class DiabetesInput(BaseModel):
    gender: int
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: int
    bmi: float
    HbA1c_level: float
    blood_glucose_level: float


@router.post("/predict/diabetes")
def predict_diabetes(data: DiabetesInput):

    features = [[
        data.gender,
        data.age,
        data.hypertension,
        data.heart_disease,
        data.smoking_history,
        data.bmi,
        data.HbA1c_level,
        data.blood_glucose_level
    ]]

    prediction = diabetes_model.predict(features)

    return {
        "prediction": int(prediction[0])
    }