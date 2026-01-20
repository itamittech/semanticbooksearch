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


5.  **Hybrid Search (Vector + Keyword Fusion)**:
    *   **Educational Lab**: A dedicated "Hybrid Search" tab that visually decomposes the search process.
    *   **Rank Fusion (RRF)**: Demonstrates how combining Semantic Search (vector) with Keyword Search (text) yields superior results using Reciprocal Rank Fusion.
    *   **Side-by-Side Comparison**: Users can see "What the AI found" vs "What the DB found" and the final fused result.

6.  **Real-time AI Verification (LLM-as-a-Judge)**:
    *   **Evaluator AI**: A separate AI model acts as a judge, evaluating the main assistant's responses for Faithfulness and Relevance in real-time.
    *   **Visual Insights**: Users can trigger an evaluation and view detailed scores and reasoning directly within the chat interface, promoting transparency.

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

#### Option A: Build & Run (Production Mode - Recommended)
The project is configured to build the full stack automatically using Maven.

1.  **Build the Project**:
    ```bash
    ./mvnw clean package
    ```
    *(This command will automatically install Node/NPM, build the React frontend, and package it into the JAR).*

2.  **Run the App**:
    ```bash
    java -jar target/semanticbooksearchlive-0.0.1-SNAPSHOT.jar
    ```

3.  **Access**: Open [http://localhost:8080](http://localhost:8080).

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
    *   `src/pages`: Main views (Search, Chat, AddBook, HybridSearch).
    *   `src/index.css`: The "Soul" of the styling (Leanpub-inspired variables).
*   `src/main/java`: The Spring Boot backend.
    *   `controller/HybridSearchController.java`: Dedicated endpoint for the Hybrid Search module.
    *   `service/HybridSearchService.java`: Orchestrates Vector + Keyword search fusion.
    *   `util/RankFusionUtils.java`: Custom implementation of Reciprocal Rank Fusion (RRF).

## 💡 Key Design Patterns implemented

*   **Single Page Application (SPA) Serving**: The backend is configured to forward non-API requests to `index.html`, allowing React Router to handle client-side navigation seamlessly.
*   **Tool Calling**: The Chat Client is configured with functions (`searchLibrary`) that the LLM can invoke autonomously to query the database.
*   **LLM-as-a-Judge**: A meta-evaluation pattern where one LLM critiques the output of another to ensure quality and relevance.
*   **Hybrid Search & RRF**: A pattern merging "fuzzy" vector results with "precise" full-text results to cover both conceptual and specific user queries.
*   **Prompt Engineering**: Specialized system prompts ensure the AI acts as a helpful Librarian and strictly adheres to facts.
