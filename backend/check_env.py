import os

def main():
    key_present = bool(os.getenv("GEMINI_API_KEY"))
    model = os.getenv("GEMINI_MODEL")
    print("GEMINI_API_KEY_PRESENT" if key_present else "GEMINI_API_KEY_MISSING")
    print(f"GEMINI_MODEL={model if model else '<not set>'}")

if __name__ == '__main__':
    main()
