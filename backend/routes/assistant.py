from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import re
import os
import numpy as np

from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer


router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    context: dict | None = None



# ==========================
# Load AI Conversation Dataset
# ==========================

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "natural remedies",
    "train.csv"
)


df = pd.read_csv(DATASET_PATH)


questions = []
answers = []


for conversation in df["Conversation"]:

    if pd.isna(conversation):
        continue

    human = re.search(
        r"\[\|Human\|\](.*?)\[\|AI\|\]",
        conversation,
        re.S
    )

    ai = re.search(
        r"\[\|AI\|\](.*)",
        conversation,
        re.S
    )

    if human and ai:

        questions.append(
            human.group(1).strip()
        )

        answers.append(
            ai.group(1).strip()


        )


print("Loaded conversations:", len(questions))


# ==========================
# AI Model + Saved Embeddings
# ==========================

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Chat model loaded")


question_embeddings = np.load(
    os.path.join(BASE_DIR, "question_embeddings.npy")
)

questions = np.load(
    os.path.join(BASE_DIR, "questions.npy"),
    allow_pickle=True
)

answers = np.load(
    os.path.join(BASE_DIR, "answers.npy"),
    allow_pickle=True
)

print("Embeddings loaded")


# ==========================
# Chat Endpoint
# ==========================

@router.post("/assistant/chat")
def assistant_chat(data: ChatRequest):

    user_question = data.question.strip()

    if not user_question:
        return {
            "answer": "Please ask me a health-related question."
        }


    # Convert user question into embedding

    user_embedding = model.encode(
        [user_question],
        convert_to_numpy=True
    )


    # Compare with saved embeddings

    similarity_scores = cosine_similarity(
        user_embedding,
        question_embeddings
    )[0]


    best_index = similarity_scores.argmax()

    confidence = similarity_scores[best_index]


    print(
        "Match:",
        questions[best_index],
        "Score:",
        confidence
    )


    if confidence > 0.45:
        return {
            "answer": str(answers[best_index])
        }


    return {
        "answer": "I could not find a close medical conversation for this question. Please provide more details about your symptoms, duration, and severity."
    }