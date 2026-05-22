import os
import google.generativeai as genai

def main():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        print("GEMINI_API_KEY_MISSING")
        return
    genai.configure(api_key=key)
    try:
        models = genai.models.list_models()
        names = [m.get("name") for m in models.get("models", []) if m.get("name")]
        for n in names:
            print(n)
    except Exception as e:
        print("ERROR_LISTING_MODELS", str(e))

if __name__ == '__main__':
    main()
