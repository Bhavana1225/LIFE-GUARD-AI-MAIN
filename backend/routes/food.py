from fastapi import APIRouter, Query
import pandas as pd
import os

router = APIRouter()

# Food dataset path
BASE_PATH = "datasets/food nutrition dataset/FINAL FOOD DATASET"

# Load and combine all food datasets
files = [
    "FOOD-DATA-GROUP1.csv",
    "FOOD-DATA-GROUP2.csv",
    "FOOD-DATA-GROUP3.csv",
    "FOOD-DATA-GROUP4.csv",
    "FOOD-DATA-GROUP5.csv"
]

food_list = []

for file in files:
    path = os.path.join(BASE_PATH, file)
    df = pd.read_csv(path)
    food_list.append(df)

food_df = pd.concat(food_list, ignore_index=True)


@router.get("/food/search")
def search_food(name: str = Query(...)):

    result = food_df[
        food_df["food"]
        .astype(str)
        .str.contains(name, case=False, na=False)
    ]

    if result.empty:
        return {
            "message": "Food not found"
        }

    foods = []

    for _, row in result.head(1000).iterrows():

        foods.append({
            "food": str(row["food"]),
            "calories": row["Caloric Value"],
            "fat": row["Fat"],
            "carbohydrates": row["Carbohydrates"],
            "protein": row["Protein"],
            "fiber": row["Dietary Fiber"],
            "sugar": row["Sugars"],
            "vitamin_c": row["Vitamin C"],
            "vitamin_a": row["Vitamin A"],
            "calcium": row["Calcium"],
            "iron": row["Iron"],
            "potassium": row["Potassium"],
            "nutrition_density": row["Nutrition Density"]
        })

    return {
        "count": len(foods),
        "results": foods
    }