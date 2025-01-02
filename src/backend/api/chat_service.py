from agents.agent_engine import chat_with_agent

def process_user_query(user_input: str) -> dict:
    """
    Process the user's input using the LangChain agent.
    
    Args:
        user_input (str): The query from the user.
    
    Returns:
        dict: The agent's response containing content and links
    """
    try:
        response = chat_with_agent(user_input)
        return response  # Already contains {"content": str, "links": list}
    except Exception as e:
        print(f"Error processing user query: {e}")
        return {
            "content": "Sorry, there was an error processing your request. Please try again later.",
            "links": []
        }