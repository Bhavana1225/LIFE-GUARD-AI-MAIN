from fastapi import APIRouter
from pydantic import BaseModel
import joblib

router = APIRouter()

heart_model = joblib.load("models/heart_model.pkl")


class HeartInput(BaseModel):
    age: float
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int


@router.post("/predict/heart")
def predict(data: HeartInput):
    prediction = heart_model.predict([[
        data.age,
        data.sex,
        data.cp,
        data.trestbps,
        data.chol,
        data.fbs,
        data.restecg,
        data.thalach,
        data.exang,
        data.oldpeak,
        data.slope,
        data.ca,
        data.thal
    ]])

    return {
        "prediction": int(prediction[0])
    }