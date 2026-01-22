# Semantic Book Search with Spring AI (React Edition)

**Semantic Search** & **RAG** powered by **Spring AI**, **PGVector**, and a **Premium React UI**.

## 🚀 Key Features

1.  **Semantic Search & Hybrid Retrieval**: Find books by meaning, not just keywords, using vector embeddings. Includes **Hybrid Search** (Vector + Keyword + RRF) for maximum accuracy.
2.  **Unified Multi-Modal Chat**:
    *   **Visual Search**: Upload book covers to identify and find them in your library.
    *   **Agentic Verification**: AI autonomously tools to verify book availability.
    *   **Book Personas**: Chat with specific books (e.g., "Alice in Wonderland") using deep RAG context.
3.  **Premium UI**: A "Leanpub-inspired" React interface with dark themes, glassmorphism, and smooth transitions.
4.  **Visual Knowledge Graph**: Interactive 2D force-directed graph visualizing semantic connections between books.
5.  **AI Study Room**: Upload course materials (PDF/DOCX), generate flashcards, take quizzes, and chat with an AI Tutor grounded in your syllabus.
6.  **The Great Debate**: "Intellectual Colosseum" arena where the AI simulates debates between any two uploaded documents (PDF/TXT) using sliding-window memory.
7.  **Evaluator AI**: Real-time "LLM-as-a-Judge" evaluates answer quality and faithfulness.

10. **The Great Debate (Standalone Arena)**:
    *   **"Intellectual Colosseum" UI**: A premium, game-like interface with neon visuals, dedicated avatars, and animated "VS" badges.
    *   **Any-File Support**: Upload any two documents (PDF, TXT, DOCX) directly to the arena.
    *   **Context-Aware Debater**: The AI automatically parses both files, generates tailored personas, and conducts a 6-turn debate using RAG to cite specific arguments from the uploaded texts.
    *   **Sliding Window Logic**: Implements a sliding context window to manage token limits while maintaining debate continuity.
    *   **Temporary Storage**: Uses a dedicated, ephemeral vector store session that keeps your main library clean.

8.  **Intelligent Curriculum Generator**:
    *   **Topic-to-Syllabus**: Enter any topic (e.g., "Stoicism") and the AI acts as a Professor.
    *   **Live TOC Extraction**: Automatically extracts Table of Contents from Project Gutenberg books on-the-fly.
    *   **Timeline UI**: Generates a week-by-week study plan with specific reading assignments from your library.

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
    *   `service/HybridSearchService.java`: Orchestrates Vector + Keyword search fusion.
    *   `util/RankFusionUtils.java`: Custom implementation of Reciprocal Rank Fusion (RRF).
    *   `controller/StandaloneDebateController.java`: Manages the debate API and turn-based logic.
    *   `controller/CurriculumController.java`: Handles course generation requests.
    *   `service/debate/DebateOrchestratorService.java`: The core "referee" that manages prompts, context windows, and persona switching.
    *   `service/CurriculumService.java`: The "Professor" agent that designs the syllabus.
    *   `service/TOCExtractorService.java`: Intelligent scraping of Gutenberg book structures.

## 💡 Key Design Patterns implemented

*   **Single Page Application (SPA) Serving**: The backend is configured to forward non-API requests to `index.html`, allowing React Router to handle client-side navigation seamlessly.
*   **Tool Calling**: The Chat Client is configured with functions (`searchLibrary`) that the LLM can invoke autonomously to query the database.
*   **LLM-as-a-Judge**: A meta-evaluation pattern where one LLM critiques the output of another to ensure quality and relevance.
*   **Hybrid Search & RRF**: A pattern merging "fuzzy" vector results with "precise" full-text results to cover both conceptual and specific user queries.
*   **Prompt Engineering**: Specialized system prompts ensure the AI acts as a helpful Librarian and strictly adheres to facts.
*   **Vector Visualization**: Techniques to map high-dimensional embeddings to 2D space (using similarity thresholds) for human-readable exploration.
