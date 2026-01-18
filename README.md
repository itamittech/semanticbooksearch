# Semantic Book Search with Spring AI

This project demonstrates the power of **Semantic Search** and **Retrieval Augmented Generation (RAG)** using **Spring AI**, **Vector Embeddings**, and **PGVector**.

Unlike traditional keyword search which matches exact words, semantic search understands the *meaning* and *intent* behind a query.

## 🚀 Features (Prompt Engineering 2.0)
This project goes beyond simple RAG, employing **Advanced Agentic Patterns**:

1.  **Unified Multi-Modal Chat** 👁️💬:
    -   **Visual Search**: Upload a book cover directly in the chat window.
    -   **Agentic Verification**: The AI **Identifies** the book (Vision), immediately **Ignores** standard context, and autonomously **Calls a Tool** (`searchLibrary`) to verify if the book exists in your database.
    -   **Outcome**: Zero hallucinations about missing books. If found, it confirms. If missing, it suggests adding it.

2.  **RAG Chat (Retrieval Augmented Generation)**:
    -   Chat with your library as if it were a person. "Do you have any books about Mars?"
    -   **Strict Fidelity**: The AI is guardrailed to *only* discuss books in your collection.

3.  **Library Expansion (Function Calling)**:
    -   Ask for a missing book (e.g., *"Do you have The pragmatic programmer?"*).
    -   The AI detects it's missing (via Tool Use) and offers to add it.
    -   If you say "yes", it generates a structured JSON entry -> triggers the `addBookToLibrary` tool -> updates `books.json` & `PGVector`.

4.  **Smart Persona**:
    -   Handles small talk ("Hi", "Thanks") without wasting database resources.
    -   Professional "Librarian" persona enforced via System Prompt.

## Configuration Notes
-   **Model**: `gpt-4o-mini` (Required for Vision & Cost Efficiency).
-   **Spring AI**: Version 1.0.0-SNAPSHOT (supporting multi-modal inputs).
-   **Prompt Engineering**: See `library-assistant.st` for the **Chain-of-Thought** logic used to prioritize Tool Usage over RAG Context for images.

## 🛠 Tech Stack

- **Java 21**
- **Spring Boot 3.x**
- **Spring AI**: for Embeddings, Vector Store, and Chat Client.
- **PostgreSQL (PGVector)**: Vector database.
- **Thymeleaf**: Server-side templating.
- **Docker Compose**: For orchestrating the database.

## 🏃‍♂️ How to Run

1. **Prerequisites**: Ensure you have Docker and Java 21 installed.
2. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```
3. **Run the Application**:
   ```bash
   ./mvnw spring-boot:run
   ```
4. **Access the UI**:
   Open your browser to [http://localhost:8080](http://localhost:8080).

## 💡 Key Concepts Explained

### 1. Vector Embeddings
When books are loaded, their descriptions are passed to an AI model which converts the text into a "vector" (a long list of numbers). This vector represents the *semantic meaning* of the text.

### 2. Retrieval Augmented Generation (RAG)
When you use the "Chat with Library" feature:
1. **Retrieval**: We search the Vector Database for books relevant to your question.
2. **Augmentation**: We inject the summaries of those found books into a prompt for the AI.
3. **Generation**: The AI generates an answer based on that specific context. 
   > *User: "What books do you have about the future?"*
   > *System: Finds "The Martian Chronicles" and "Neuromancer" -> Sends to AI -> AI answers.*

### 3. Hybrid Filtering
We combine vector search with metadata filtering (`genre == 'History'`). This ensures that even if a fiction book has a semantically similar description to your query, it is excluded if it doesn't match the genre filter.

### 4. Agentic Tool Use (Function Calling)
The Chatbot is not just a text generator; it is an **Agent** equipped with tools.
1.  **Search Tool**: When you upload an image, the AI *autonomously* decides to call `searchLibrary(title)` to verify the book's existence, ignoring potential hallucinations from the generic context.
2.  **Add Tool**: If you confirm "Add this book", the AI triggers the `addBookToLibrary` tool to persist the new book into the `PGVector` database and `books.json`.

### 5. Prompt Engineering Strategies
-   **Context Override**: We explicitly instruct the AI to **IGNORE** the retrieved RAG context when an image is present, preventing "Context Poisoning" from irrelevant text matches.
-   **Chain of Thought**: The System Prompt enforces a strict step-by-step reasoning process (Identify -> Tool -> Answer).

## 📂 Project Structure

- `src/main/resources/data/books.json`: The dataset (can be updated via UI).
- `src/main/resources/templates/index.html`: The Thymeleaf UI.
- `src/main/java/.../controller/BookSemanticSearchController.java`: The core logic for Search, Chat, and Management.
- `src/main/java/.../controller/BookWebController.java`: Serves the webpage.

## 📝 Usage

1. **Load Data**: Click **"Load Books from JSON"** to populate the database.
2. **Search**: Enter a query like "aliens" and see result. Try filtering by Genre.
3. **Chat**: Switch to the **Chat** tab and ask "Recommend me a book about war strategies".
4. **Add Book**: Click **"+ Add Custom Book"**, fill in details, and it will be immediately available for search and chat.
