from fastapi import Request

async def log_request_data(request: Request, call_next):
    """Log incoming request data."""
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    return response
