from fastapi import APIRouter, HTTPException
from api.chat_service import process_user_query
from db.models import ChatRequest

router = APIRouter()

MAX_QUERY_LENGTH = 1000

@router.post("/chat")
def chat(request: ChatRequest):
    try:
        user_query = request.query
        if not user_query:
            raise HTTPException(status_code=400, detail="Query cannot be empty.")
        if len(user_query) > MAX_QUERY_LENGTH:
            raise HTTPException(status_code=400, detail="Query is too long.")
            
        response = process_user_query(user_query)
        return {
            "response": response["content"],
            "links": response["links"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))