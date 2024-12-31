# src/backend/agents/agent_engine.py

import os
import json
import sys

from dotenv import load_dotenv

# LangChain imports
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents.base import BaseCombineDocumentsChain
from langchain.schema import Document
from langchain.chains import RetrievalQA
# Services
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from services import create_faiss_index, get_retriever, search_similar_documents

import tiktoken

def count_tokens(prompt, model="gpt-3.5-turbo"):
    """Utility function to count tokens using tiktoken."""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(prompt))

# -----------------------------------------------------------------------------
# 1. Load environment variables
# -----------------------------------------------------------------------------
load_dotenv()


# -----------------------------------------------------------------------------
# 2. Initialize LLM (ChatOpenAI for GPT-3.5-turbo)
# -----------------------------------------------------------------------------
llm = ChatOpenAI(
    temperature=0,
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-3.5-turbo-16k"
)


# -----------------------------------------------------------------------------
# 3. Load & Prepare Blog Data
# -----------------------------------------------------------------------------
def load_blog_data():
    """Load blog content from your JSON file."""
    try:
        with open('/Users/doa_ai/Developer/OOAD-tech-blog-project/.contentlayer/generated/Blog/_index.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading blog data: {e}")
        return []


def prepare_blog_texts(blogs):
    """Prepare blog chunks and metadata."""
    texts = []
    metadatas = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    for blog in blogs:
        # -------------- FIX: Ensure raw_content is a string ---------------
        raw_content = blog['body'].get('raw', '')

        if not isinstance(raw_content, str):
            # Convert dict or list to string so we don't break the embedding function
            raw_content = json.dumps(raw_content)

        chunks = text_splitter.split_text(raw_content)

        for chunk in chunks:
            texts.append(chunk)
            metadatas.append({
                'title': blog['title'],
                'url': blog.get('url', ''),
                'author': blog.get('author', 'Unknown')
            })

    return texts, metadatas


# -----------------------------------------------------------------------------
# 4. Create FAISS Index & Retriever
# -----------------------------------------------------------------------------
blogs = load_blog_data()
texts, metadatas = prepare_blog_texts(blogs)
docstore = [
    {"content": text, "metadata": metadata} 
    for text, metadata in zip(texts, metadatas)
]
vectorstore = create_faiss_index(blogs_data=blogs, texts=texts, metadatas=metadatas)
retriever = get_retriever(vectorstore)
if retriever is None:
    raise RuntimeError("Failed to initialize retriever. Check FAISS index creation.")


# -----------------------------------------------------------------------------
# 5. Define Optimized Prompt
# -----------------------------------------------------------------------------
BLOG_QA_PROMPT = PromptTemplate(
    template="""You are a AI helpful assistant to help the user can reads news. Provide a general response.

Titles:
{context}

Question: {question}

Answer:""",
    input_variables=["context", "question"]
)


# -----------------------------------------------------------------------------
# 6. Helper: Format Context
# -----------------------------------------------------------------------------
def format_context(docs) -> str:
    """Format titles for context, limit to unique relevant blogs & stay within token limits."""
    unique_urls = set()
    unique_titles = []
    max_token_limit = 3000  # Ensure the prompt stays well within the token limit

    for doc in docs:
        url = doc["metadata"].get('url')
        if url not in unique_urls:
            unique_urls.add(url)
            title_entry = f"- {doc['metadata']['title']} ({url})"
            # Check token count before adding
            if count_tokens("\n".join(unique_titles + [title_entry])) < max_token_limit:
                unique_titles.append(title_entry)

    # Limit context to top 3 titles if needed
    return "\n".join(unique_titles[:3])




def chat_with_agent(user_input: str) -> str:
    if retriever is None:
        return "Retriever is not available. Please check FAISS index creation."

    # Retrieve relevant documents
    docs = search_similar_documents(vectorstore, docstore, user_input, score_threshold=0.75)


    # If no docs found, fallback to direct LLM
    if not docs:
        return llm.predict(f"Answer the question: {user_input}")

    # The rest of your code remains the same
    context = format_context(docs)
    prompt = BLOG_QA_PROMPT.format(context=context, question=user_input)
    print(f"Prompt sent:\n{prompt}")
    print(f"Token count: {count_tokens(prompt)}")

    qa_chain = RetrievalQA.from_chain_type(
        retriever=retriever,
        llm=llm,
        chain_type_kwargs={"prompt": BLOG_QA_PROMPT}
    )


    result = qa_chain.invoke({"query": user_input})
    answer = result['result']

    response = f"{answer}\n\nRelevant posts:\n{context}"
    return response

# -----------------------------------------------------------------------------
# 8. Entry Point
# -----------------------------------------------------------------------------
def main():
    user_input = "What is the best way to learn Python?"
    print(chat_with_agent(user_input))

if __name__ == "__main__":
    main()