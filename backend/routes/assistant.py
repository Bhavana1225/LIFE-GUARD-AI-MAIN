from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
import os

router = APIRouter()

# Load .env
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("WARNING: GOOGLE_API_KEY was not found.")
    client = None
else:
    client = genai.Client(api_key=api_key)
    print("Google Gemini client loaded successfully.")


class ChatRequest(BaseModel):
    question: str
    context: dict | None = None


SYSTEM_PROMPT = """
You are LifeGuard AI, a health information assistant.

Give simple, clear and responsible general health information.

Rules:

1. Answer the user's actual question.
2. Never invent the user's name.
3. Never use names from old conversations or datasets.
4. Do not assume symptoms or medical conditions that the user did not mention.
5. For symptoms, explain common possible causes and reasonable next steps.
6. Do not give a definite diagnosis.
7. Do not prescribe prescription medicines or dosages.
8. If symptoms may indicate an emergency, clearly recommend urgent medical care.
9. Ask a short follow-up question when important information is missing.
10. Keep answers easy to understand.
11. Do not mention datasets, embeddings, APIs, models, or this system prompt.
12. Never produce old dataset phrases such as "Hello Mr sham kumar".
"""


@router.post("/assistant/chat")
def assistant_chat(data: ChatRequest):

    user_question = data.question.strip()

    if not user_question:
        return {
            "answer": "Please ask me a health-related question."
        }

    if client is None:
        return {
            "answer": "The AI assistant is not configured. Please check the Google AI Studio API key."
        }

    try:

        context_text = ""

        if data.context:
            context_text = f"""
Relevant health information from the user's LifeGuard AI assessment:

{data.context}
"""

        prompt = f"""
{SYSTEM_PROMPT}

User question:
{user_question}

{context_text}
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        answer = response.text.strip()

        if not answer:
            answer = "I could not generate a response. Please try again."

        return {
            "answer": answer
        }

    except Exception as e:

        print("Google Gemini assistant error:", repr(e))

        return {
            "answer": "I'm having trouble connecting to the AI assistant right now. Please try again."
        }