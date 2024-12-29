from agents import chat_with_agent  # Use relative import

def process_user_query(user_input: str) -> str:
    """
    Process the user's input using the LangChain agent.
    
    Args:
        user_input (str): The query from the user.
    
    Returns:
        str: The agent's response.
    """
    try:
        response = chat_with_agent(user_input)
        return response
    except Exception as e:
        print(f"Error processing user query: {e}")
        return "Sorry, there was an error processing your request. Please try again later."