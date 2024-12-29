from utils import generate_response

def process_user_query(query: str) -> str:
    """Processes user query and generates a response."""
    response = generate_response(query)
    return response
