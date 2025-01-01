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
    """
    Create and save FAISS index
    
    Args:
        blogs_data: List of blog data
        texts: List of text content to index
        metadatas: List of metadata for each text
        save_path: Path to the directory to save FAISS index
        
    Returns:
        FAISS vectorstore object or None if creation fails
    """
    try:
        # Validate inputs
        if not texts or not metadatas:
            logger.error("Empty texts or metadatas provided")
            return None
            
        if len(texts) != len(metadatas):
            logger.error("Number of texts and metadatas must match")
            return None

        logger.info(f"Creating FAISS index with {len(texts)} documents...")
        
        # Create the vectorstore
        vectorstore = FAISS.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas
        )
        
        if not vectorstore:
            logger.error("Failed to create vectorstore")
            return None
            
        # Create directory if it doesn't exist
        save_dir = Path(save_path)
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # Save the index
        try:
            vectorstore.save_local(str(save_dir))
            logger.info(f"FAISS index saved successfully to directory: {save_dir}")
        except Exception as save_error:
            logger.error(f"Failed to save FAISS index: {save_error}")
            # Even if save fails, return the in-memory index
            return vectorstore
        
        return vectorstore
        
    except Exception as e:
        logger.error(f"Failed to create FAISS index: {e}")
        return None

def load_faiss_index(load_path: str = "blog_index.faiss") -> Optional[FAISS]:
    """
    Load FAISS index from disk
    
    Args:
        load_path: Path to the directory containing FAISS index
        
    Returns:
        FAISS vectorstore object or None if loading fails
    """
    try:
        index_dir = Path(load_path)
        
        # Check if directory exists and contains required files
        if not index_dir.is_dir():
            logger.error(f"Index directory not found at {index_dir}")
            return None
            
        # Check for required files (index.faiss and index.pkl)
        required_files = ["index.faiss", "index.pkl"]
        missing_files = [f for f in required_files if not (index_dir / f).exists()]
        
        if missing_files:
            logger.error(f"Missing required files in {index_dir}: {missing_files}")
            return None
            
        logger.info(f"Loading FAISS index from directory: {index_dir}")
        vectorstore = FAISS.load_local(
            folder_path=str(index_dir),
            embeddings=embeddings,
            allow_dangerous_deserialization=True
        )
        
        # Validate the loaded index
        if not vectorstore or not hasattr(vectorstore, 'docstore'):
            logger.error("Loaded index is invalid or corrupted")
            return None
            
        doc_count = len(vectorstore.docstore._dict)
        logger.info(f"FAISS index loaded successfully with {doc_count} documents")
        return vectorstore
        
    except Exception as e:
        logger.error(f"Failed to load FAISS index: {e}")
        return None

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

def get_or_create_index(
    blogs_data: Optional[list] = None,
    texts: Optional[list[str]] = None,
    metadatas: Optional[list[dict]] = None,
    index_path: str = "blog_index.faiss"
) -> Optional[FAISS]:
    """
    Get existing FAISS index or create a new one if it doesn't exist
    
    Args:
        blogs_data: List of blog data (only needed for creation)
        texts: List of text content (only needed for creation)
        metadatas: List of metadata (only needed for creation)
        index_path: Path to save/load the FAISS index
        
    Returns:
        FAISS vectorstore object or None if both loading and creation fail
    """
    # First try to load existing index
    vectorstore = load_faiss_index(index_path)
    if vectorstore:
        logger.info("Successfully loaded existing FAISS index")
        return vectorstore
        
    # If loading fails and we have data, create new index
    if texts and metadatas:
        logger.info("No existing index found, creating new one...")
        vectorstore = create_faiss_index(
            blogs_data=blogs_data,
            texts=texts,
            metadatas=metadatas,
            save_path=index_path
        )
        if vectorstore:
            logger.info("Successfully created new FAISS index")
            return vectorstore
    else:
        logger.error("No existing index found and no data provided to create new one")
        
    return None