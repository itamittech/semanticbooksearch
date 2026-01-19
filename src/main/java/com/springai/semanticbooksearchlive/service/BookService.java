package com.springai.semanticbooksearchlive.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.springai.semanticbooksearchlive.model.Book;
import com.springai.semanticbooksearchlive.model.CompareSearchResponse;
import com.springai.semanticbooksearchlive.model.SearchResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ClassPathResource;
import org.springframework.ai.content.Media;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.util.MimeTypeUtils;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final ObjectMapper objectMapper;
    private final ChatMemory chatMemory;
    private final com.springai.semanticbooksearchlive.advisor.InsightAdvisor insightAdvisor;
    private static final String BOOKS_JSON_PATH = "src/main/resources/data/books.json";

    @Value("classpath:prompts/library-assistant.st")
    private Resource systemPromptResource;

    public BookService(VectorStore vectorStore, ChatClient.Builder builder, ObjectMapper objectMapper) {
        this.vectorStore = vectorStore;
        this.insightAdvisor = new com.springai.semanticbooksearchlive.advisor.InsightAdvisor();
        // Register 'this' bean as a tool provider
        this.chatClient = builder
                .defaultTools(this)
                .defaultAdvisors(this.insightAdvisor)
                .build();
        this.objectMapper = objectMapper;
        this.chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(new InMemoryChatMemoryRepository())
                .maxMessages(100)
                .build();
    }

    public List<Book> getAllBooks() {
        return loadBooksFromJson();
    }

    public String loadBooksToVectorStore() {
        List<Book> books = loadBooksFromJson();
        List<Document> documents = books.stream()
                .map(this::mapBookToDocument)
                .collect(Collectors.toList());

        // Production Best Practice: Idempotency via Deterministic IDs + DB Constraint
        // We do NOT manually delete here. We rely on the DB to handle the
        // upsert/conflict
        // based on the PRIMARY KEY constraint on the 'id' column.

        // 3. Add the fresh documents
        vectorStore.add(documents);
        return "Successfully loaded " + books.size() + " books into vector store (DB Constraint Idempotency)";
    }

    public Set<String> getGenres() {
        return loadBooksFromJson().stream()
                .map(Book::genre)
                .collect(Collectors.toSet());
    }

    public void addBook(Book book) {
        addBookToLibrary(book);
    }

    @Tool(description = "Adds a book to the library collection. Use this when the user explicitly confirms they want to add a book.")
    public String addBookToLibrary(@ToolParam(description = "The book object to add") Book book) {
        try {
            List<Book> existingBooks = loadBooksFromJson();

            // Check for duplicates
            boolean exists = existingBooks.stream()
                    .anyMatch(b -> b.title().equalsIgnoreCase(book.title()));

            if (exists) {
                return "Book '" + book.title() + "' already exists in the library.";
            }

            // Fix: Ensure Book has an ID if missing (common when adding via Chatbot)
            Book bookToAdd = book;
            if (book.id() == null || book.id().trim().isEmpty()) {
                String newId = java.util.UUID.randomUUID().toString();
                bookToAdd = new Book(newId, book.title(), book.author(), book.summary(), book.genre(),
                        book.publicationYear(), book.imageUrl());
            }

            // 1. Update JSON File
            List<Book> books = new ArrayList<>(existingBooks);
            books.add(bookToAdd);
            File file = Paths.get(BOOKS_JSON_PATH).toFile();
            objectMapper.writeValue(file, books);

            // 2. Add to Vector Store
            Document document = mapBookToDocument(bookToAdd);
            vectorStore.add(List.of(document));
            return "Book '" + bookToAdd.title() + "' added to library successfully.";
        } catch (IOException e) {
            throw new RuntimeException("Failed to add book", e);
        }
    }

    public String chat(String query, Resource imageResource) {
        // 1. Retrieve related documents
        List<Document> documents = vectorStore.similaritySearch(SearchRequest.builder().query(query).topK(3).build());
        String context = documents.stream().map(Document::getText).collect(Collectors.joining("\n"));

        // 2. Prepare User Message with Image if present
        UserMessage message = new UserMessage(query);
        if (imageResource != null) {
            message.getMedia().add(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource));
        }

        // 3. Chat with Advisor
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
        List<Book> allBooks = loadBooksFromJson();
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

    private List<Book> loadBooksFromJson() {
        try {
            // Fix: Read from the same file system path we write to, preventing
            // 'split-brain' between src and target
            File file = Paths.get(BOOKS_JSON_PATH).toFile();
            if (file.exists()) {
                return objectMapper.readValue(file, new TypeReference<List<Book>>() {
                });
            } else {
                // Fallback to classpath if file doesn't exist (e.g. first run)
                Resource resource = new ClassPathResource("data/books.json");
                return objectMapper.readValue(resource.getInputStream(), new TypeReference<List<Book>>() {
                });
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load books from JSON", e);
        }
    }

    private Document mapBookToDocument(Book book) {
        String content = "Title: " + book.title() + ", Author: " + book.author()
                + ", Description: " + book.summary();
        Map<String, Object> metadata = Map.of(
                "id", book.id(),
                "title", book.title(),
                "author", book.author(),
                "genre", book.genre(),
                "publicationYear", book.publicationYear(),
                "imageUrl", book.imageUrl());

        // Production Trick: Generate a UUID based on the Book ID.
        // This ensures that "Book 1" ALWAYS has the same UUID "c4ca4238...",
        // preventing duplicates even across restarts or different sessions.
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
