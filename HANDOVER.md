# Project Handover: Semantic Book Search (Multi-Modal Agent)

## 📌 Project State Summary
This is a **Spring AI** application implementing **RAG (Retrieval Augmented Generation)** and **Agentic Tool Use**.
It has been successfully refactored from a simple chatbot into a **Multi-Modal Agent** that can handle Text and Images.

### Core Architecture
-   **Stack**: Java 21, Spring Boot 3.4.x, Spring AI 1.x (Milestone/Snapshot).
-   **Database**: PostgreSQL with `pgvector` extension (Dockerized).
-   **Model**: `gpt-4o-mini` (Used for both Chat and Vision).
-   **Embedding**: `text-embedding-3-small`.

### Key Features Implemented
1.  **Unified Chat**: `BookSemanticSearchController.java` accepts `multipart/form-data` (Text + Image).
2.  **Agentic Tool Use**: `BookService.java` has a `@Tool` annotated method `searchLibrary(String query)`.
3.  **Prompt Engineering**: `library-assistant.st` is hardened to **IGNORE** RAG context when an image is present, forcing the AI to use the `searchLibrary` tool for verification.

---

## 🗺️ The Roadmap (Next Steps)
**Goal**: Transform into a "Researching Librarian" that fetches real-world data.

### Phase 1: Web Search Integration (Priority) 🕵️🌐
**Objective**: Allow the AI to fetch real book details from the web instead of hallucinating them when adding new books.

**Implementation Plan:**
1.  **Dependency**: Add `TavilyClient` (or similar) to Spring AI.
2.  **New Tool**: Create a `@Tool` in `BookService` called `fetchBookDetailsFromWeb(String title)`.
3.  **Flow Update**: 
    -   *User*: "Add 'The Coming Wave'."
    -   *AI*: Checks DB -> Not Found.
    -   *AI*: Calls `fetchBookDetailsFromWeb('The Coming Wave')`.
    -   *AI*: Uses Web Data to generate the JSON for adding the book.

### Phase 2: User Interface Upgrade 🎨
**Objective**: Modernize the UI.
-   Consider moving from Thymeleaf (`index.html`) to a React/Next.js frontend if desired, or enhance the current Thymeleaf UI with specific "Book Cards" for search results.

---

## 📂 Key Files for the Next Agent
-   **Brain**: `src/main/resources/prompts/library-assistant.st` (Crucial logic here).
-   **Service**: `src/main/java/.../service/BookService.java` (Tools and RAG logic).
-   **Controller**: `src/main/java/.../controller/BookSemanticSearchController.java`.
-   **Frontend**: `src/main/resources/static/js/app.js` (Unified `sendMessage` function).

## 🚀 Quick Start for Next Agent
1.  Run `docker-compose up -d`.
2.  Run `./mvnw spring-boot:run`.
3.  **Context Loading**: Read `README.md` and `HANDOVER.md` first.
