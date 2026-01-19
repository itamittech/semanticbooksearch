# Semantic Book Search with Spring AI (React Edition)

This project demonstrates the power of **Semantic Search** and **Retrieval Augmented Generation (RAG)** using **Spring AI**, **Vector Embeddings**, and **PGVector**, served through a **Premium, Modern React UI**.

Unlike traditional keyword search, semantic search understands the *meaning* and *intent* behind a query.

## 🚀 Key Features

This project utilizes **Advanced Agentic Patterns** wrapping powerful AI capabilities in a consumer-grade application:

1.  **Premium User Experience**:
    *   **Modern React Frontend**: Built with Vite and TypeScript for performance and type safety.
    *   **Leanpub-Inspired Design**: A clean, professional aesthetic featuring a dark header, floating cards, and a focused layout.
    *   **Responsive & Dynamic**: Smooth transitions, loading states, and interactive feedback.

2.  **Unified Multi-Modal Chat (Agentic AI)**:
    *   **Visual Search**: Upload a book cover directly in the chat window. The AI visualizes it, identifies the book, and autonomously verifies its presence in your library.
    *   **Context-Aware**: Smartly switches between visual analysis and text-based RAG depending on user input.
    *   **Zero Hallucinations**: Strictly guardrailed to only discuss books in your collection using tool-based verification.

3.  **Semantic Search & Discovery**:
    *   **Meaning-Based Search**: Find books by concept (e.g., "books about overcoming failure") rather than just keywords.
    *   **Visual Results**: Search results are displayed as rich cards with cover images, authors, and summaries.

4.  **Library Management**:
    *   **Add Books**: A dedicated interface to easily add new books to your semantic database.

## 🛠 Tech Stack

*   **Frontend**:
    *   React 18
    *   TypeScript
    *   Vite
    *   Vanilla CSS (Variables, Grid, Flexbox) - *No massive tailwind bundles*
    *   React Router DOM

*   **Backend**:
    *   Java 21
    *   Spring Boot 3.x
    *   Spring AI (Embeddings, Chat, Vector Store)
    *   PostgreSQL (PGVector extension)
    *   Docker Compose

## 🏃‍♂️ How to Run

### 1. Prerequisites
*   Docker Desktop (running)
*   Java 21
*   Node.js & npm (for frontend development)

### 2. Start Infrastructure (Database)
Start the PostgreSQL database with the PGVector extension:
```bash
docker-compose up -d
```

### 3. Build & Run the Application

The application is designed to serve the React frontend directly from Spring Boot. You have two options:

#### Option A: Run Everything (Recommended)
This builds the frontend and bundles it into the Spring Boot application.

1.  **Build Frontend**:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
    *(The build script automatically copies artifacts to `src/main/resources/static`)*

2.  **Run Backend**:
    Return to the root directory and run the Spring Boot app:
    ```bash
    cd ..
    ./mvnw spring-boot:run
    ```

3.  **Access the App**:
    Open [http://localhost:8080](http://localhost:8080).

#### Option B: Frontend Development Mode
For rapid UI iteration, you can run the React dev server separately.
1.  Start Spring Boot backend (port 8080).
2.  In a separate terminal:
    ```bash
    cd frontend
    npm run dev
    ```
3.  Access via the Vite dev server URL (usually `http://localhost:5173`). *Note: API proxying is configured automatically.*

## 📂 Project Structure

*   `frontend/`: The React application source.
    *   `src/components`: UI building blocks (Navbar, BookCard).
    *   `src/pages`: Main views (Search, Chat, AddBook).
    *   `src/index.css`: The "Soul" of the styling (Leanpub-inspired variables).
*   `src/main/java`: The Spring Boot backend.
    *   `controller/BookWebController.java`: Serves the React SPA (Handling client-side routing).
    *   `service/BookService.java`: Core RAG and Vector logic.

## 💡 Key Design Patterns implemented

*   **Single Page Application (SPA) Serving**: The backend is configured to forward non-API requests to `index.html`, allowing React Router to handle client-side navigation seamlessly.
*   **Tool Calling**: The Chat Client is configured with functions (`searchLibrary`) that the LLM can invoke autonomously to query the database.
*   **Prompt Engineering**: Specialized system prompts ensure the AI acts as a helpful Librarian and strictly adheres to facts.
