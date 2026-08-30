from fastapi import APIRouter, Query
import pandas as pd


router = APIRouter()


# Load medicine dataset
MEDICINE_PATH = "datasets/medicine information dataset/medicine.csv"

medicine_df = pd.read_csv(MEDICINE_PATH)


print("Total medicines loaded:", len(medicine_df))


@router.get("/medicine/search")
def search_medicine(
    name: str = Query(None),
    limit: int = Query(100)
):

    if name:
        result = medicine_df[
            medicine_df["brand name"]
            .astype(str)
            .str.contains(name, case=False, na=False)
        ]
    else:
        result = medicine_df


    medicines = []

    for _, row in result.head(limit).iterrows():

        medicines.append({

            "brand_name": str(row.get("brand name", "")),

            "type": str(row.get("type", "")),

            "dosage_form": str(row.get("dosage form", "")),

            "generic": str(row.get("generic", "")),

            "strength": str(row.get("strength", "")),

            "manufacturer": str(row.get("manufacturer", "")),

            "package_container": str(row.get("package container", "")),

            "package_size": str(row.get("Package Size", ""))

        })


    return {
        "count": len(medicines),
        "results": medicines
    }