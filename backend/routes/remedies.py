from fastapi import APIRouter, Query
import pandas as pd
import re

router = APIRouter()

# Load dataset
TRAIN_PATH = "datasets/natural remedies/train.csv"

remedy_df = pd.read_csv(TRAIN_PATH)


@router.get("/remedies/search")
def search_remedy(problem: str = Query(...)):

    matches = []

    for conversation in remedy_df["Conversation"]:

        text = str(conversation)

        if problem.lower() in text.lower():

            # Extract AI response
            ai_response = re.findall(
                r"\[\|AI\|\](.*)",
                text,
                re.DOTALL
            )

            matches.append({
                "conversation": text[:500],
                "remedy_response": ai_response[0].strip()
                if ai_response
                else "Response not found"
            })

        if len(matches) == 5:
            break

    if not matches:
        return {
            "message": "No remedy information found"
        }

    return {
        "count": len(matches),
        "results": matches
    }