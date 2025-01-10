
## **Agent Engine: Retrieval-Augmented QA System**

This project implements a Retrieval-Augmented QA (Question Answering) system using **LangChain**, **FAISS**, and **OpenAI GPT** models. The system is designed to answer user queries by retrieving and summarizing relevant information from blog posts. It integrates retrieval capabilities with a powerful language model to provide accurate and context-aware answers.

<p align="center">
    <img src="/demo/image.png" alt="Image 1" width="80%">
</p>

### **Features**
1. **FAISS-Based Indexing**:
   - The project uses **FAISS** (Facebook AI Similarity Search) to create an index of blog content for efficient document retrieval.
   - Each blog is split into chunks using a recursive text splitter for fine-grained indexing and searching.

2. **Retriever and Generator**:
   - **Retriever**: Retrieves the top-k most relevant blog chunks based on query similarity.
   - **Generator**: GPT-based model generates coherent and contextual answers using the retrieved documents.

3. **Optimized Prompt Engineering**:
   - The system employs a customized prompt template to guide the language model’s response generation.
   - Responses include references to specific blogs, URLs, and additional insights when necessary.

4. **Multilingual Support**:
   - Automatically detects the query language (English or Vietnamese) and generates responses in the same language.
   - Ensures user-friendly and professional communication.

5. **Dynamic Context Formatting**:
   - Combines relevant document snippets into a formatted context with titles and clickable links for easy navigation.

---

### **System Architecture**
1. **Blog Data Preparation**:
   - Blog content is loaded from a JSON file and processed into chunks using the `RecursiveCharacterTextSplitter`.
   - Metadata such as blog titles, authors, and URLs are preserved for retrieval and reference.

2. **Indexing and Retrieval**:
   - The FAISS index stores embeddings of blog chunks for similarity-based retrieval.
   - If no existing index is found, the system automatically creates a new one from the blog data.

3. **Question Answering Flow**:
   - User queries are passed to the retriever to fetch relevant blog snippets.
   - If no relevant snippets are found, the system uses GPT directly to generate an answer.
   - Retrieved snippets and user queries are fed into a **RetrievalQA** chain for response generation.

4. **Utility Features**:
   - **Token Counting**: Ensures responses are within the token limit for the selected GPT model.
   - **Context Formatting**: Includes clickable links and concise document summaries.

---



### **How to Run**
1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   - Add your **OpenAI API key** to a `.env` file:
     ```plaintext
     OPENAI_API_KEY=your_openai_api_key
     ```

3. Run the application:
   ```bash
   python src/backend/agents/agent_engine.py
   ```

4. Example query:
   - *“What is multimodal AI?”*
   - The system retrieves relevant blog posts and generates an answer with references.

---

### **Technologies Used**
- **LangChain**: For creating retrieval and question-answering chains.
- **FAISS**: For efficient vector similarity search.
- **OpenAI GPT**: For language understanding and generation.
- **tiktoken**: For token counting and managing model input limits.
- **JSON**: For structured blog data storage.

---

### **Example Response**
When asked, *“What is multimodal AI?”*:
```plaintext
Multimodal AI refers to AI systems that integrate multiple types of data such as text, images, and audio. Based on our blog, multimodal models like GPT-4 combine textual data with vision capabilities to generate diverse outputs. For further reading, visit our blog post: http://localhost:3000/multimodal-ai.
```

---

### **Acknowledgments**
It simplifies the process of accessing and understanding technical content while promoting transparency through citations and context formatting.

Feel free to enhance this description based on your preferences or the specifics of your project!