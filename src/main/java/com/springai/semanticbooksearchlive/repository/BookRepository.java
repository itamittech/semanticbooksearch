package com.springai.semanticbooksearchlive.repository;

import com.springai.semanticbooksearchlive.model.Book;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class BookRepository {

    private final JdbcClient jdbcClient;

    public BookRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<Book> findAll() {
        return jdbcClient.sql("SELECT * FROM books")
                .query(Book.class)
                .list();
    }

    public Optional<Book> findById(String id) {
        return jdbcClient.sql("SELECT * FROM books WHERE id = :id")
                .param("id", UUID.fromString(id))
                .query(Book.class)
                .optional();
    }

    public void save(Book book) {
        // Simple upsert based on title (for now) or insert if new
        // Ideally we check if exists, or use ON CONFLICT if we had a unique constraint
        // on title

        Optional<Book> existing = jdbcClient.sql("SELECT * FROM books WHERE title = :title")
                .param("title", book.title())
                .query(Book.class)
                .optional();

        if (existing.isPresent()) {
            // Update? For now, we skip to avoid duplicates or overwrite
            return;
        }

        // Handle ID generation if null
        UUID id = (book.id() == null || book.id().isEmpty()) ? UUID.randomUUID() : UUID.fromString(book.id());

        jdbcClient.sql(
                "INSERT INTO books (id, title, author, summary, genre, publication_year, image_url, has_content) VALUES (:id, :title, :author, :summary, :genre, :publicationYear, :imageUrl, :hasContent)")
                .param("id", id)
                .param("title", book.title())
                .param("author", book.author())
                .param("summary", book.summary())
                .param("genre", book.genre())
                .param("publicationYear", book.publicationYear())
                .param("imageUrl", book.imageUrl())
                .param("hasContent", false) // Default to false for new books
                .update();
    }

    public void updateHasContent(String id, boolean hasContent) {
        jdbcClient.sql("UPDATE books SET has_content = :hasContent WHERE id = :id")
                .param("id", UUID.fromString(id))
                .param("hasContent", hasContent)
                .update();
    }
}
