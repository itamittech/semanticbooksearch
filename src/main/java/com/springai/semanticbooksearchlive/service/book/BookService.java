package com.springai.semanticbooksearchlive.service.book;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.springai.semanticbooksearchlive.model.Book;
import com.springai.semanticbooksearchlive.model.CompareSearchResponse;
import com.springai.semanticbooksearchlive.model.SearchResult;
import com.springai.semanticbooksearchlive.repository.BookRepository;
import com.springai.semanticbooksearchlive.service.book.provider.BookProvider;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.content.Media;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.util.MimeTypeUtils;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

@Service
public class BookService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    private final com.springai.semanticbooksearchlive.advisor.InsightAdvisor insightAdvisor;
    private final BookRepository bookRepository;
    private final List<BookProvider> bookProviders;

    @Value("classpath:prompts/library-assistant.st")
    private Resource systemPromptResource;

    public BookService(VectorStore vectorStore, ChatClient.Builder builder, BookRepository bookRepository,
            List<BookProvider> bookProviders) {
        this.vectorStore = vectorStore;
        this.bookRepository = bookRepository;
        this.bookProviders = bookProviders;
        this.insightAdvisor = new com.springai.semanticbooksearchlive.advisor.InsightAdvisor();
        // Register 'this' bean as a tool provider
        this.chatClient = builder
                .defaultTools(this)
                .defaultAdvisors(this.insightAdvisor)
                .build();
        this.chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(new InMemoryChatMemoryRepository())
                .maxMessages(100)
                .build();
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public String loadBooksToVectorStore() {
        // Load initial books from DB
        List<Book> books = bookRepository.findAll();
        List<Document> documents = books.stream()
                .map(this::mapBookToDocument)
                .collect(Collectors.toList());

        vectorStore.add(documents);
        return "Successfully loaded " + books.size() + " books into vector store (DB Constraint Idempotency)";
    }

    public String refreshBookCatalog() {
        int count = 0;
        for (BookProvider provider : bookProviders) {
            List<Book> newBooks = provider.fetchBooks();
            for (Book book : newBooks) {
                bookRepository.save(book);

                // Also add to vector store if needed for search immediately
                // However, logic says 'loadBooksToVectorStore' handles that.
                // Let's add them incrementally here too for better UX.
                Document doc = mapBookToDocument(book);
                vectorStore.add(List.of(doc));

                ensureCoverImageExists(book.imageUrl(), book.title());
                count++;
            }
        }
        return "Refreshed catalog with " + count + " new books from providers.";
    }

    public Set<String> getGenres() {
        return bookRepository.findAll().stream()
                .map(Book::genre)
                .collect(Collectors.toSet());
    }

    public void addBook(Book book) {
        addBookToLibrary(book);
    }

    @Tool(description = "Adds a book to the library collection. Use this when the user explicitly confirms they want to add a book.")
    public String addBookToLibrary(@ToolParam(description = "The book object to add") Book book) {
        try {
            // Check for duplicates in DB
            // Assuming simplified check via repo save logic or optional lookup.
            // For tool response, we might want to be explicit.
            // But since save is idempotent-ish in our logic:

            // Fix: Ensure Book has an ID if missing
            Book bookToAdd = book;
            if (book.id() == null || book.id().trim().isEmpty()) {
                String newId = UUID.randomUUID().toString();
                bookToAdd = new Book(newId, book.title(), book.author(), book.summary(), book.genre(),
                        book.publicationYear(), book.imageUrl());
            }

            // 1. Save to DB
            bookRepository.save(bookToAdd);

            // 2. Add to Vector Store
            Document document = mapBookToDocument(bookToAdd);
            vectorStore.add(List.of(document));

            // 3. Ensure local cover image exists
            ensureCoverImageExists(bookToAdd.imageUrl(), bookToAdd.title());

            return "Book '" + bookToAdd.title() + "' added to library successfully.";
        } catch (Exception e) {
            throw new RuntimeException("Failed to add book", e);
        }
    }

    private void ensureCoverImageExists(String imageUrl, String title) {
        if (imageUrl == null || !imageUrl.startsWith("/images/books/")) {
            return;
        }

        try {
            File imageFile = new File("frontend/public" + imageUrl);

            if (!imageFile.exists()) {
                if (imageFile.getParentFile() != null) {
                    imageFile.getParentFile().mkdirs();
                }

                String placeholderUrl = "https://placehold.co/400x600?text="
                        + URLEncoder.encode(title, StandardCharsets.UTF_8);

                java.net.URLConnection connection = new URI(placeholderUrl).toURL().openConnection();
                connection.setRequestProperty("User-Agent", "Mozilla/5.0");

                try (java.io.InputStream in = connection.getInputStream()) {
                    Files.copy(in, imageFile.toPath());
                }
            }
        } catch (Exception e) {
            System.err.println(
                    "Warning: Failed to generate local cover image for: " + title + ". Error: " + e.getMessage());
        }
    }

    public String chat(String query, Resource imageResource) {
        List<Document> documents = vectorStore.similaritySearch(SearchRequest.builder().query(query).topK(3).build());
        String context = documents.stream().map(Document::getText).collect(Collectors.joining("\n"));

        UserMessage message = new UserMessage(query);
        if (imageResource != null) {
            message.getMedia().add(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource));
        }

        return chatClient.prompt()
                .system(s -> s.text(systemPromptResource).param("context", context))
                .messages(message)
                .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .advisors(a -> a.param("chat_memory_conversation_id", "default"))
                .call()
                .content();
    }

    @Tool(description = "Searches the library for books matching the query. Returns a list of matching book titles and authors.")
    public String searchLibrary(@ToolParam(description = "The title, author, or topic to search for") String query) {
        CompareSearchResponse response = search(query, "All", 5);
        List<SearchResult> results = response.semantic();

        if (results.isEmpty()) {
            return "No matching books found in the library.";
        }

        return results.stream()
                .map(r -> r.book().title() + " by " + r.book().author())
                .collect(Collectors.joining("\n"));
    }

    public CompareSearchResponse search(String query, String genre, int limit) {
        // 1. Semantic Search (Vector) with optional Filter
        SearchRequest.Builder requestBuilder = SearchRequest.builder()
                .query(query)
                .topK(limit);

        if (genre != null && !genre.isEmpty() && !genre.equals("All")) {
            requestBuilder.filterExpression("genre == '" + genre + "'");
        }

        List<Document> documents = vectorStore.similaritySearch(requestBuilder.build());
        List<SearchResult> semanticResults = constructSearchResult(documents);

        // 2. Keyword Search
        // Note: For now, fetching all books from DB for simple keyword search might be
        // okay for small scale,
        // but for larger DB, we should use SQL LIKE query in Repository.
        // For strict compatibility with previous logic & small dataset, we fetch all.
        List<Book> allBooks = bookRepository.findAll();
        List<SearchResult> keywordResults = allBooks.stream()
                .filter(book -> {
                    boolean matchesQuery = book.title().toLowerCase().contains(query.toLowerCase()) ||
                            book.author().toLowerCase().contains(query.toLowerCase()) ||
                            book.summary().toLowerCase().contains(query.toLowerCase());
                    boolean matchesGenre = (genre == null || genre.isEmpty() || genre.equals("All")
                            || book.genre().equalsIgnoreCase(genre));
                    return matchesQuery && matchesGenre;
                })
                .limit(limit)
                .map(book -> new SearchResult(book, 1.0))
                .collect(Collectors.toList());

        return new CompareSearchResponse(semanticResults, keywordResults);
    }

    private Document mapBookToDocument(Book book) {
        String content = "Title: " + book.title() + ", Author: " + book.author()
                + ", Description: " + book.summary();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", book.id());
        metadata.put("title", book.title() != null ? book.title() : "");
        metadata.put("author", book.author() != null ? book.author() : "");
        metadata.put("genre", book.genre() != null ? book.genre() : "");
        metadata.put("publicationYear", book.publicationYear());
        metadata.put("imageUrl", book.imageUrl() != null ? book.imageUrl() : "");

        String deterministicId = java.util.UUID.nameUUIDFromBytes(book.id().getBytes()).toString();
        return new Document(deterministicId, content, metadata);
    }

    private List<SearchResult> constructSearchResult(List<Document> documents) {
        return documents.stream()
                .map(doc -> {
                    Map<String, Object> metadata = doc.getMetadata();
                    Book book = new Book(
                            (String) metadata.getOrDefault("id", ""),
                            (String) metadata.getOrDefault("title", ""),
                            (String) metadata.getOrDefault("author", ""),
                            doc.getText(),
                            (String) metadata.getOrDefault("genre", ""),
                            metadata.containsKey("publicationYear")
                                    ? ((Number) metadata.get("publicationYear")).intValue()
                                    : 0,
                            (String) metadata.getOrDefault("imageUrl", ""));

                    double score = getScore(metadata);
                    return new SearchResult(book, score);
                })
                .collect(Collectors.toList());
    }

    private double getScore(Map<String, Object> metadata) {
        double score = 0.0;
        if (metadata.containsKey("distance")) {
            score = 1 - ((Number) metadata.get("distance")).doubleValue();
        }
        return score;
    }
}
