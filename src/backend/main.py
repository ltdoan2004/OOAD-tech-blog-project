from fastapi import FastAPI
from api.routes import router as api_router
from middlewares.logging import log_request_data
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI Backend"}