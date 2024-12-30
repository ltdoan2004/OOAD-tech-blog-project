from fastapi import APIRouter, HTTPException
from api import process_user_query

router = APIRouter()  # Initialize the router

MAX_QUERY_LENGTH = 1000

@router.post("/chat")
def chat(query: dict):
    try:
        user_query = query.get("query")
        if not user_query:
            raise HTTPException(status_code=400, detail="Query cannot be empty.")
        if len(user_query) > MAX_QUERY_LENGTH:
            raise HTTPException(status_code=400, detail="Query is too long.")
        response = process_user_query(user_query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))