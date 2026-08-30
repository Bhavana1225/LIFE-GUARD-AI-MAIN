from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.heart import router as heart_router
from routes.diabetes import router as diabetes_router
from routes.stroke import router as stroke_router
from routes.kidney import router as kidney_router
from routes.medicine import router as medicine_router
from routes.food import router as food_router
from routes import nearby
from routes.sos import router as sos_router
from routes.assistant import router as assistant_router

app = FastAPI(
    title="LifeGuard AI API",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://10.208.148.217:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Register Routes

app.include_router(heart_router)
app.include_router(diabetes_router)
app.include_router(stroke_router)
app.include_router(kidney_router)
app.include_router(medicine_router)
app.include_router(food_router)
app.include_router(nearby.router)
app.include_router(sos_router)
app.include_router(assistant_router)



@app.get("/")
def home():
    return {
        "message":"LifeGuard AI Backend is Running Successfully!"
    }