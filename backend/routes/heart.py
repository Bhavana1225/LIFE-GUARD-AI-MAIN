from fastapi import APIRouter
from pydantic import BaseModel
import joblib

router = APIRouter()

heart_model = joblib.load("models/heart_model.pkl")


class HeartInput(BaseModel):
    age: float
    sex: int
    dataset: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalch: float
    exang: int
    oldpeak: float
    slope: int


@router.post("/predict/heart")
def predict_heart(data: HeartInput):

    features = [[
        data.age,
        data.sex,
        data.dataset,
        data.cp,
        data.trestbps,
        data.chol,
        data.fbs,
        data.restecg,
        data.thalch,
        data.exang,
        data.oldpeak,
        data.slope
    ]]

    prediction = heart_model.predict(features)

    return {
        "prediction": int(prediction[0])
    }