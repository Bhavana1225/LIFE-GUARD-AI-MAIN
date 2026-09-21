import pandas as pd
import re
import os
import numpy as np
from sentence_transformers import SentenceTransformer


# =========================
# PATH
# =========================

BASE_DIR = os.path.dirname(__file__)

DATASET_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "natural remedies",
    "train.csv"
)


# =========================
# LOAD DATASET
# =========================

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded!")


# =========================
# EXTRACT QUESTIONS & ANSWERS
# =========================

questions = []
answers = []


for conversation in df["Conversation"]:

    if pd.isna(conversation):
        continue

    conversation = str(conversation)

    # Find every Human -> AI pair
    pattern = (
        r"\[\|Human\|\](.*?)"
        r"\[\|AI\|\](.*?)"
        r"(?=\[\|Human\|\]|\Z)"
    )

    matches = re.findall(
        pattern,
        conversation,
        re.DOTALL
    )

    for human_question, ai_answer in matches:

        human_question = human_question.strip()
        ai_answer = ai_answer.strip()

        # Ignore empty entries
        if not human_question or not ai_answer:
            continue

        # Ignore extremely short questions
        if len(human_question) < 3:
            continue

        questions.append(human_question)
        answers.append(ai_answer)


print(
    "Total questions extracted:",
    len(questions)
)

print(
    "Total answers extracted:",
    len(answers)
)


# =========================
# REMOVE DUPLICATE QUESTIONS
# =========================

unique_questions = []
unique_answers = []

seen_questions = set()


for question, answer in zip(
    questions,
    answers
):

    normalized_question = (
        question
        .lower()
        .strip()
    )

    if normalized_question not in seen_questions:

        seen_questions.add(
            normalized_question
        )

        unique_questions.append(
            question
        )

        unique_answers.append(
            answer
        )


questions = unique_questions
answers = unique_answers


print(
    "Unique questions:",
    len(questions)
)


# =========================
# LOAD EMBEDDING MODEL
# =========================

print("\nLoading AI model...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("AI model loaded!")


# =========================
# CREATE EMBEDDINGS
# =========================

print("\nCreating embeddings...")

embeddings = model.encode(
    questions,
    batch_size=64,
    convert_to_numpy=True,
    show_progress_bar=True,
    normalize_embeddings=True
)


# =========================
# SAVE EMBEDDINGS
# =========================

np.save(
    os.path.join(
        BASE_DIR,
        "question_embeddings.npy"
    ),
    embeddings
)


# =========================
# SAVE QUESTIONS
# =========================

np.save(
    os.path.join(
        BASE_DIR,
        "questions.npy"
    ),
    np.array(
        questions,
        dtype=object
    )
)


# =========================
# SAVE ANSWERS
# =========================

np.save(
    os.path.join(
        BASE_DIR,
        "answers.npy"
    ),
    np.array(
        answers,
        dtype=object
    )
)


# =========================
# DONE
# =========================

print("\n================================")
print("Embeddings saved successfully!")
print("================================")

print(
    "question_embeddings.npy"
)

print(
    "questions.npy"
)

print(
    "answers.npy"
)