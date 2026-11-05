from services.groq_service import generate_response

try:
    reply = generate_response("Hello! Introduce yourself as Cognovio in one sentence.")
    print("\nGroq API Response:")
    print(reply)

except Exception as e:
    print("\nGroq API Error:")
    print(type(e).__name__, str(e))