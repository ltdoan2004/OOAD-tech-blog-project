from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from typing import Optional, List, Dict
import os
from pathlib import Path
from dotenv import load_dotenv
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

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
    metadatas: list[dict],
    save_path: str = "blog_index.faiss"
) -> Optional[FAISS]:
    """Create and save FAISS index"""
    try:
        # Initialize embeddings
        embeddings = OpenAIEmbeddings()
        
        # Create FAISS index
        vectorstore = FAISS.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas
        )
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Save index
        vectorstore.save_local(save_path)
        print(f"Successfully created and saved FAISS index to {save_path}")
        
        return vectorstore
    except Exception as e:
        print(f"Error creating FAISS index: {e}")
        raise

def load_faiss_index(folder_path: str = "blog_index.faiss") -> Optional[FAISS]:
    """Load FAISS index from disk"""
    try:
        # Initialize embeddings
        embeddings = OpenAIEmbeddings()
        
        # Load the index
        vectorstore = FAISS.load_local(
            folder_path=folder_path,
            embeddings=embeddings
        )
        
        print(f"Successfully loaded FAISS index from {folder_path}")
        return vectorstore
        
    except Exception as e:
        print(f"Failed to load FAISS index: {e}")
        raise

def search_documents(
    vectorstore: FAISS,
    query: str,
    k: int = 5,
    score_threshold: float = 0.7
) -> List[Dict]:
    """
    Search documents using FAISS's built-in similarity search.
    
    Args:
        vectorstore: FAISS vectorstore object
        query: Search query string
        k: Number of results to return
        score_threshold: Minimum similarity score threshold
        
    Returns:
        List of documents with their similarity scores
    """
    try:
        if not vectorstore:
            logger.error("No vectorstore provided")
            return []
            
        if not query or not isinstance(query, str):
            logger.error("Invalid query provided")
            return []
            
        # Use FAISS's built-in similarity search with scores
        docs_and_scores = vectorstore.similarity_search_with_score(query, k=k)
        
        # Process results
        results = []
        for doc, score in docs_and_scores:
            # Convert distance to similarity score (FAISS returns L2 distance)
            similarity_score = 1 / (1 + score)  # Convert distance to similarity (0-1 range)
            
            if similarity_score >= score_threshold:
                results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": float(similarity_score)
                })
        
        # Sort by similarity score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results
        
    except Exception as e:
        logger.error(f"Error during document search: {e}")
        return []

def get_retriever(vectorstore: FAISS, k: int = 3):
    """Get retriever from vectorstore"""
    if vectorstore is None:
        return None
    return vectorstore.as_retriever(search_kwargs={"k": k})

def get_or_create_index(folder_path: str, blogs_data=None, texts=None, metadatas=None):
    """Get existing FAISS index or create new one if needed."""
    try:
        # Try to load existing index
        return load_faiss_index(folder_path=folder_path)
    except Exception as e:
        print(f"Could not load existing index: {e}")
        
        # If we have data, create new index
        if blogs_data and texts and metadatas:
            return create_faiss_index(
                blogs_data=blogs_data,
                texts=texts,
                metadatas=metadatas,
                save_path=folder_path
            )
        else:
            raise ValueError("No existing index found and no data provided to create new one")