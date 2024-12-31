from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from typing import Optional
import os
from pathlib import Path
from dotenv import load_dotenv
import logging
from langchain.schema import Document
from langchain.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from typing import List, Dict, Tuple
from operator import itemgetter
from itertools import groupby
import numpy as np
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


def hybrid_search(retriever, index, query_vector: np.ndarray, query: str, filters: Optional[Dict] = None, k: int = 5, score_threshold: float = 0.7):
    """
    Hybrid search function combining semantic and keyword-based retrieval.

    Args:
        retriever: The retriever object capable of performing keyword searches.
        index: FAISS index for semantic search.
        query_vector: Precomputed vector for the query.
        query: Search query string.
        filters: Optional dictionary of filters to apply.
        k: Number of results to return.
        score_threshold: Minimum similarity score (0-1) for semantic results.

    Returns:
        List of unique documents sorted by relevance.
    """
    if filters is None:
        filters = {}

    # Semantic search using FAISS
    semantic_results = search_similar_documents(index, query_vector, k=k, score_threshold=score_threshold)

    # Keyword-based retrieval
    keyword_results = retriever.retrieve(query, filters=filters, top_k=k)

    # Combine results, remove duplicates, and sort by relevance
    combined_results = semantic_results + [
        {
            "content": doc.page_content,
            "metadata": doc.metadata,
            "similarity_score": None  # No score for keyword-based results
        }
        for doc in keyword_results if doc.metadata['url'] not in {item['metadata']['url'] for item in semantic_results}
    ]

    # Sort combined results, prioritize semantic results by score
    sorted_results = sorted(
        combined_results,
        key=lambda x: x["similarity_score"] if x["similarity_score"] is not None else 0,
        reverse=True
    )

    return sorted_results[:k]


def search_similar_documents(
    vectorstore,
    docstore: List[Dict],
    query: str,
    k: int = 5,
    score_threshold: float = 0.8
) -> List[Dict]:
    """
    Perform semantic search using a FAISS index.

    Args:
        vectorstore: FAISS index object.
        docstore: List of documents with their metadata.
        query: Search query string.
        k: Number of results to return.
        score_threshold: Minimum similarity score to include result.

    Returns:
        List of documents with content, metadata, and similarity score.
    """
    # Ensure the query is a single string
    if not isinstance(query, str):
        raise ValueError("Query must be a single string.")

    query_vector = vectorstore.embedding_function.embed_query(query)
    query_vector = np.array(query_vector).reshape(1, -1)  # Ensure query_vector is a 2D NumPy array
    distances, indices = vectorstore.index.search(query_vector, k)

    filtered_results = []
    if len(distances) == 0 or len(indices) == 0:
        return filtered_results

    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:  # Handle invalid indices
            continue
        normalized_score = 1 - (dist / 2)  # Normalize cosine similarity
        if normalized_score >= score_threshold:
            # Retrieve document from the docstore using the FAISS index
            doc = docstore[idx]
            filtered_results.append({
                "content": doc["content"],
                "metadata": doc["metadata"],
                "similarity_score": normalized_score
            })

    return filtered_results




def get_retriever(vectorstore: FAISS, k: int = 3):
    """Get retriever from vectorstore"""
    if vectorstore is None:
        return None
    return vectorstore.as_retriever(search_kwargs={"k": k})