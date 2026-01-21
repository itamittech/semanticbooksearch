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
    *   **Bulk Loading**: One-click "Load Defaults" to populate the database with a curated list of classic books.

5.  **Visual Knowledge Graph (The "AI Brain")**:
    *   **Interactive Visualization**: A force-directed graph (2D) that visualizes your entire library as a universe of interconnected nodes.
    *   **True Semantic Connections**: Links between books are drawn based on real **Cosine Similarity** of their vector embeddings (1536 dimensions), not just genres.
    *   **Explorable**: Zoom, pan, and drag nodes to discover how the AI "clusters" concepts (e.g., sci-fi books near philosophy books).
    *   **Custom Physics**: Built from scratch using SVG and React physics, featuring auto-clustering and dynamic visuals.


    *   **Evaluator AI**: A separate AI model acts as a judge, evaluating the main assistant's responses for Faithfulness and Relevance in real-time.
    *   **Visual Insights**: Users can trigger an evaluation and view detailed scores and reasoning directly within the chat interface, promoting transparency.

7.  **Hybrid Search (Vector + Keyword Fusion)**:
    *   **Educational Lab**: A dedicated "Hybrid Search" tab that visually decomposes the search process.
    *   **Rank Fusion (RRF)**: Demonstrates how combining Semantic Search (vector) with Keyword Search (text) yields superior results using Reciprocal Rank Fusion.
    *   **Side-by-Side Comparison**: Users can see "What the AI found" vs "What the DB found" and the final fused result.

6.  **Real-time AI Verification (LLM-as-a-Judge)**:
    *   **Evaluator AI**: A separate AI model acts as a judge, evaluating the main assistant's responses for Faithfulness and Relevance in real-time.
    *   **Visual Insights**: Users can trigger an evaluation and view detailed scores and reasoning directly within the chat interface, promoting transparency.

8.  **Talk to the Book (Deep RAG)**:
    *   **Dedicated Persona**: Chat specifically with a book (e.g., "Alice in Wonderland"). The AI adopts the book's persona and restricts its knowledge to that book's content.
    *   **Deep Context**: Uses a specialized `book_content_vector_store` optimized for storing thousands of chunks per book, ensuring high-fidelity answers.

9.  **AI Study Room (Educational Platform)**:
    *   **Course Management**: Create courses and organize study materials (PDFs, PPTs, DOCs) in a dedicated dashboard with multiple file upload support (up to 100MB).
    *   **AI Teacher Persona**: A dedicated AI tutor grounded *strictly* in your uploaded course materials. It will refuse to answer questions outside the syllabus.
    *   **Smart Flashcards**: Automatically generates a deck of flashcards based on your course content with a realistic, skeuomorphic "flip" UI.
    *   **Adaptive Quizzes**: Generates instant 5-question multiple-choice quizzes to test your knowledge, providing immediate grading and feedback.
    *   **Document Parsing**: Powered by Apache Tika to extract text from a wide variety of document formats transparently.

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
*   **Vector Visualization**: Techniques to map high-dimensional embeddings to 2D space (using similarity thresholds) for human-readable exploration.
