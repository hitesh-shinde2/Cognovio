import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL_NAME = "openai/gpt-oss-20b"


def generate_response(message: str) -> str:
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Cognovio, a supportive AI wellbeing companion for students "
                    "and young adults navigating everyday life. You help people with "
                    "stress, anxiety, emotions, relationships, academic or career pressure, "
                    "personal challenges, and self-development. "
                    "Be empathetic, friendly, non-judgmental, and conversational. "
                    "Never assume that a user is a university student. "
                    "Listen carefully, provide practical and thoughtful guidance, "
                    "and never claim to replace professional mental health support."
                )
            },
            {
                "role": "user",
                "content": message
            }
        ],
        temperature=0.7,
        max_tokens=500
    )

    return response.choices[0].message.content