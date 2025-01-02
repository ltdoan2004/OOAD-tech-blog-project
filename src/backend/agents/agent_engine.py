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

from services import create_faiss_index, get_retriever, search_documents, load_faiss_index, get_or_create_index
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
        print(blog['title'])
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
index_path = "/Users/doa_ai/Developer/OOAD-tech-blog-project/blog_index.faiss"

# Only create new index if we have data
if texts and metadatas:
    try:
        # Try to load existing index first
        vectorstore = load_faiss_index(folder_path=index_path)
        print("Loaded existing FAISS index")
    except Exception as e:
        print(f"Creating new FAISS index: {e}")
        # Create new index if loading fails
        vectorstore = create_faiss_index(
            blogs_data=blogs,
            texts=texts,
            metadatas=metadatas,
            save_path=index_path
        )
else:
    raise RuntimeError("No blog data available to create index")

# Create retriever from vectorstore
if vectorstore is not None:
    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 5}
    )
else:
    raise RuntimeError("Failed to initialize vectorstore")

if retriever is None:
    raise RuntimeError("Failed to initialize retriever. Check FAISS index creation.")


# -----------------------------------------------------------------------------
# 5. Define Optimized Prompt
# -----------------------------------------------------------------------------
BLOG_QA_PROMPT = PromptTemplate(
    template="""You are a friendly and knowledgeable AI assistant that specializes in technology and AI topics. You can communicate in both English and Vietnamese, matching the language of the user's question. Your primary role is to help users understand the content from our tech blog while also providing additional insights when needed.

    Context from our blog posts:
    {context}

    Question: {question}

    Guidelines for your response:
    1. PRIORITY: First check and use information from our blog content above
    2. If the blogs contain relevant information:
       - Cite specific parts from our blogs
       - Mention which blog post contains this information
       - Provide the blog link for further reading
    3. If our blogs don't have enough information:
       - First acknowledge that our blogs don't fully cover this topic
       - Then provide a general answer based on your knowledge
       - Suggest that they might want to check our other AI-related blog posts
    4. Style:
       - Keep responses clear and engaging
       - Break down technical concepts when needed
       - Match the language of the user's question (English/Vietnamese)
       - For Vietnamese responses, use professional but friendly tone
    5. Always maintain accuracy and cite sources when possible

    Answer:""",
    input_variables=["context", "question"]
)


# -----------------------------------------------------------------------------
# 6. Helper: Format Context
# -----------------------------------------------------------------------------
def format_context(docs) -> str:
    """Format context with both titles and relevant content from retrieved documents."""
    unique_docs = {}  # Use dict to track unique documents and their content
    formatted_sections = []
    max_token_limit = 3000
    seen_urls = set()  # Track seen URLs to avoid duplicates

    # First pass: collect unique documents and their best content
    for doc in docs:
        url = doc["metadata"].get('url', '')
        title = doc["metadata"].get('title', 'Untitled')
        
        # Skip if we've seen this URL before
        if url in seen_urls:
            continue
            
        seen_urls.add(url)
        
        # Create full URL for the blog post
        full_url = f"http://localhost:3000{url}" if url else None
        
        if url not in unique_docs:
            unique_docs[url] = {
                'title': title,
                'url': full_url,
                'content': [],
                'score': doc.get('similarity_score', 0)
            }
        
        # Add content snippet with high relevance
        if 'content' in doc:
            unique_docs[url]['content'].append(doc['content'])

    # Second pass: format the context with titles and relevant content
    for doc_info in sorted(unique_docs.values(), key=lambda x: x['score'], reverse=True):
        section = []
        
        # Add title with clickable link
        if doc_info['url']:
            section.append(f"\n## [{doc_info['title']}]({doc_info['url']})")
        else:
            section.append(f"\n## {doc_info['title']}")
        
        # Add most relevant content snippets
        if doc_info['content']:
            # Take first 2 most relevant snippets to keep context focused
            for snippet in doc_info['content'][:2]:
                # Clean and format the snippet
                cleaned_snippet = snippet.strip().replace('\n', ' ')
                if len(cleaned_snippet) > 300:  # Limit snippet length
                    cleaned_snippet = cleaned_snippet[:300] + "..."
                section.append(cleaned_snippet)
        
        formatted_section = '\n'.join(section)
        
        # Check token limit before adding
        current_context = '\n'.join(formatted_sections)
        if count_tokens(current_context + formatted_section) < max_token_limit:
            formatted_sections.append(formatted_section)
        else:
            break

    # If no sections were added, return a message
    if not formatted_sections:
        return "No relevant content found."

    # Combine all sections with clear separation
    final_context = "\n---\n".join(formatted_sections)
    
    # Add a header to explain the context
    header = "Here are the most relevant sections from the blog posts:\n"
    
    return header + final_context




def chat_with_agent(user_input: str) -> dict:
    """Return structured response with separate content and links"""
    if retriever is None:
        return {
            "content": "Retriever is not available. Please check FAISS index creation.",
            "links": []
        }

    # Retrieve relevant documents
    docs = search_documents(
        vectorstore=vectorstore,
        query=user_input,
        k=5,
        score_threshold=0.7
    )

    # If no docs found, fallback to direct LLM
    if not docs:
        return {
            "content": llm.predict(f"Answer the question: {user_input}"),
            "links": []
        }

    # Get context and format links
    context = format_context(docs)
    
    # Extract unique links from context
    seen_urls = set()
    links = []
    for doc in docs:
        url = doc["metadata"].get("url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            links.append({
                "title": doc["metadata"].get("title", "Untitled"),
                "url": f"http://localhost:3000{url}"
            })

    # Generate answer
    prompt = BLOG_QA_PROMPT.format(context=context, question=user_input)
    qa_chain = RetrievalQA.from_chain_type(
        retriever=retriever,
        llm=llm,
        chain_type_kwargs={"prompt": BLOG_QA_PROMPT}
    )

    result = qa_chain.invoke({"query": user_input})
    answer = result['result']

    # Return structured response with deduplicated links
    return {
        "content": answer,
        "links": links
    }

# -----------------------------------------------------------------------------
# 8. Entry Point
# -----------------------------------------------------------------------------
def main():
    user_input = "I want to talk about the multimodal?"
    print(chat_with_agent(user_input))

if __name__ == "__main__":
    main()