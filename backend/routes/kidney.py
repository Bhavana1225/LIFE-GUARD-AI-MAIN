from fastapi import APIRouter
from pydantic import BaseModel
import joblib

router = APIRouter()

# Load Kidney Model
kidney_model = joblib.load("models/kidney_model.pkl")


class KidneyInput(BaseModel):
    age: float
    bp: float
    sg: float
    al: float
    su: float
    rbc: int
    pc: int
    pcc: int
    ba: int
    bgr: float
    bu: float
    sc: float
    sod: float
    pot: float
    hemo: float
    pcv: float
    wc: float
    rc: float
    htn: int
    dm: int
    cad: int
    appet: int
    pe: int
    ane: int


@router.post("/predict/kidney")
def predict_kidney(data: KidneyInput):

    features = [[
        data.age,
        data.bp,
        data.sg,
        data.al,
        data.su,
        data.rbc,
        data.pc,
        data.pcc,
        data.ba,
        data.bgr,
        data.bu,
        data.sc,
        data.sod,
        data.pot,
        data.hemo,
        data.pcv,
        data.wc,
        data.rc,
        data.htn,
        data.dm,
        data.cad,
        data.appet,
        data.pe,
        data.ane
    ]]

    prediction = kidney_model.predict(features)

    return {
        "prediction": int(prediction[0])
    }