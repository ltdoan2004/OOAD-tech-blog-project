from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from typing import Optional
import os
from pathlib import Path
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).parent.parent.parent.parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    logger.info(f"Loaded environment variables from {env_path}")
else:
    logger.warning(f"No .env file found at {env_path}")

def get_embeddings():
    """Initialize OpenAI embeddings with API key"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("OPENAI_API_KEY not found in environment variables")
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    return OpenAIEmbeddings(openai_api_key=api_key)

# Initialize embeddings after environment variables are loaded
try:
    embeddings = get_embeddings()
    logger.info("OpenAI embeddings initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI embeddings: {e}")
    raise

def create_faiss_index(
    blogs_data: list,
    texts: list[str], 
    metadatas: list[dict]
) -> Optional[FAISS]:
    """Create or load FAISS index"""
    index_dir = Path(__file__).parent
    index_path = index_dir / "blog_index.faiss"

    logger.info("Checking for existing FAISS index...")

    # Try loading existing index
    if index_path.exists():
        try:
            logger.info(f"Loading existing FAISS index from {index_path}")
            return FAISS.load_local(str(index_path), embeddings, allow_dangerous_deserialization=True)
        except Exception as e:
            logger.error(f"Error loading FAISS index: {e}. Deleting corrupted index.")
            index_path.unlink()  # Delete corrupted index

    # Validate inputs
    if not texts or not metadatas:
        logger.error("Texts or metadatas are empty. Cannot create FAISS index.")
        return None

    # Create new index
    try:
        logger.info("Creating a new FAISS index...")
        vectorstore = FAISS.from_texts(texts, embeddings, metadatas=metadatas)
        vectorstore.save_local(str(index_path))
        logger.info(f"FAISS index saved to {index_path}")
        return vectorstore
    except Exception as e:
        logger.error(f"Failed to create FAISS index: {e}")
        return None



def get_retriever(vectorstore: FAISS, k: int = 3):
    """Get retriever from vectorstore"""
    if vectorstore is None:
        return None
    return vectorstore.as_retriever(search_kwargs={"k": k})