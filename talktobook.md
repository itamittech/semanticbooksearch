# Talk to the Book - Backend Implementation Guide

This document details the backend architecture for the "**Talk to the Book**" (Deep RAG) feature. This feature allows users to chat with a *specific* book, ensuring the AI only uses knowledge derived from that book's content.

## 1. Architectural Decision: Deep RAG vs. Wide RAG

Standard RAG (Retrieval Augmented Generation) usually searches across the entire knowledge base ("Wide RAG"). However, for this feature, we need to restrict the context strictly to one book.

To achieve this efficient filtering and management of dense book content (chunks), we introduced a **Dedicated Vector Table**.

## 2. Database Schema

We created a new table `book_content_vector_store` separate from the main `vector_store`. This separation allows:
1.  **Cleaner Data**: Detailed chunks don't pollute the main search index.
2.  **Performance**: Queries are naturally scoped to a smaller dataset (or filtered efficiently).

```sql
CREATE TABLE IF NOT EXISTS book_content_vector_store (
	id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	content text,
	metadata json, -- Must contain 'book_id'
	embedding vector(1536)
);

CREATE INDEX ... ON book_content_vector_store USING HNSW (embedding vector_cosine_ops);
```

## 3. Backend Implementation Components

### A. Repository (`BookContentRepository.java`)
We opted for a low-level implementation using `JdbcClient` instead of the high-level `VectorStore` bean.

**Why?**
The high-level `VectorStore` is typically configured for one main table. Configuring multiple `VectorStore` beans for different tables can be complex. Using `JdbcClient` gives us direct control over the SQL, allowing us to:
- Write custom `WHERE` clauses for `book_id`.
- Manually handle the vector similarity math (`<=>` operator).

```java
// Logic for Similarity Search with Filter
String sql = """
        SELECT content, metadata
        FROM book_content_vector_store
        WHERE (metadata->>'book_id') = :bookId
        ORDER BY embedding <=> :embedding
        LIMIT 5
        """;
```

### B. Service (`BookChatService.java`)
This service orchestrates the RAG flow:

1.  **Retrieve**: Calls repository with user query and `bookId`.
2.  **Prompt**: Constructs a System Prompt that enforces the *Persona*:
    > "You are the book '{title}'. You must answer questions based ONLY on the provided context..."
3.  **Generate**: Calls `ChatClient` with the context-enriched prompt.

### C. Ingestion ("Demo Mode")
Since we don't have full text for our existing metadata-only library, we implemented a `loadDemoBook` function.
- **Source**: Fetches "Alice in Wonderland" text from Project Gutenberg (public domain).
- **Process**:
    1.  Downloads raw text.
    2.  Splits into tokens using `TokenTextSplitter`.
    3.  Embeds and saves to `book_content_vector_store`.

## 4. Usage (API)

**1. Load Demo Book**
```bash
POST /api/books/load-demo
```

**2. Chat with Book**
```bash
POST /api/books/demo-alice/chat/content
{
    "message": "What did the white rabbit say?"
}
```
