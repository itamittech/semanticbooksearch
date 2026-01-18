# Semantic Book Search with Spring AI

This project demonstrates the power of **Semantic Search** and **Retrieval Augmented Generation (RAG)** using **Spring AI**, **Vector Embeddings**, and **PGVector**.

Unlike traditional keyword search which matches exact words, semantic search understands the *meaning* and *intent* behind a query.

## 🚀 Features

- **Semantic Search**: Find books based on descriptions and concepts (e.g., "stories about space colonization" finds "The Martian Chronicles").
- **Hybrid Search**: Filter results by Genre while performing vector search.
- **RAG Chat**: Chat with an AI librarian that answers questions/recommendations based *only* on the books in your collection.
- **Smart Fallback & Expansion**: If a book isn't in the library, the AI offers to generate its details from internal knowledge and add it to the collection automatically.
- **Dynamic Book Management**: Add new books via the UI and have them instantly indexed for vector search.
- **Keyword Search Comparison**: See side-by-side results comparing semantic search with traditional keyword matching.

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

### 4. Smart Fallback & Tool Use
The Chatbot is equipped with **Function Calling**.
1. If you ask for a missing book, the prompt instructs the AI to offer to generate details.
2. If you agree, the AI acts as a "creative generator" to structure the book data (JSON).
3. If you confirm "Add this book", the AI autonomously triggers the `addBookToLibrary` tool to persist the new book into the `PGVector` database and `books.json`.

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
