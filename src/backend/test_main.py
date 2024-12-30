from fastapi.testclient import TestClient
from unittest.mock import patch
from backend.main import app
from ..backend.api.chat_service import process_user_query
from ..backend.agents.agent_engine import chat_with_agent

client = TestClient(app)

def test_read_root():
    """Test the root endpoint returns the welcome message"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the FastAPI Backend"}

def test_chat_endpoint_success():
    test_query = "What is FastAPI?"
    test_response = "FastAPI is a modern web framework for building APIs with Python"

    with patch('src.backend.api.chat_service.process_user_query') as mock_process:
        mock_process.return_value = test_response

        response = client.post("/api/chat", json={"query": test_query})
        # assert response.status_code == 200
        # assert response.json() == {"response": test_response}
        print(response.json())


def test_chat_endpoint_error():
    test_query = "What is FastAPI?"
    with patch('src.backend.api.chat_service.process_user_query') as mock_process:
        mock_process.side_effect = Exception("Service error")

        response = client.post("/api/chat", json={"query": test_query})
        assert response.status_code == 500
        assert response.json() == {"detail": "Service error"}


def test_chat_with_agent():
    test_query = "How do I use FastAPI?"
    key_phrases = ["FastAPI", "framework", "building APIs"]

    with patch('src.backend.agents.agent_engine.chat_with_agent') as mock_chat_with_agent:
        mock_chat_with_agent.return_value = "FastAPI is a modern framework for building APIs"

        response = chat_with_agent(test_query)
        for phrase in key_phrases:
            assert phrase in response


def test_empty_query_handling():
    response = client.post("/api/chat", json={"query": ""})
    assert response.status_code == 400
    assert response.json() == {"detail": "Query cannot be empty."}


def test_invalid_request_format():
    response = client.post("/api/chat", json={"invalid_key": "some value"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid request format"}


def test_long_query_handling():
    long_query = "x" * 1001
    response = client.post("/api/chat", json={"query": long_query})
    assert response.status_code == 400
    assert response.json() == {"detail": "Query too long."}
