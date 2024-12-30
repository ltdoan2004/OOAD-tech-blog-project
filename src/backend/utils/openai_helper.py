import openai

def generate_response(query: str) -> str:
    """Generates a response using OpenAI's API."""
    openai.api_key = "your-openai-api-key"
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=query,
        max_tokens=150
    )
    return response.choices[0].text.strip()
