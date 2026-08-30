import pandas as pd
import re
import os
import numpy as np

from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(__file__)

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


print("Total questions:", len(questions))


print("Loading model...")

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


print("Creating embeddings...")


embeddings = model.encode(
    questions,
    batch_size=64,
    convert_to_numpy=True,
    show_progress_bar=True
)


np.save(
    os.path.join(BASE_DIR, "question_embeddings.npy"),
    embeddings
)


np.save(
    os.path.join(BASE_DIR, "questions.npy"),
    np.array(questions, dtype=object)
)


np.save(
    os.path.join(BASE_DIR, "answers.npy"),
    np.array(answers, dtype=object)
)


print("Embeddings saved successfully!")