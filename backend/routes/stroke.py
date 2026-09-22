from fastapi import APIRouter
from pydantic import BaseModel
import joblib

router = APIRouter()

# Load Stroke Model
stroke_model = joblib.load("models/stroke_model.pkl")


class StrokeInput(BaseModel):
    gender: int
    age: float
    hypertension: int
    heart_disease: int
    ever_married: int
    work_type: int
    Residence_type: int
    avg_glucose_level: float
    bmi: float
    smoking_status: int


@router.post("/predict/stroke")
def predict_stroke(data: StrokeInput):

    features = [[
        data.gender,
        data.age,
        data.hypertension,
        data.heart_disease,
        data.ever_married,
        data.work_type,
        data.Residence_type,
        data.avg_glucose_level,
        data.bmi,
        data.smoking_status
    ]]

    prediction = stroke_model.predict(features)

    return {
        "prediction": int(prediction[0])
    }