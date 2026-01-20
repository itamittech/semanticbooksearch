package com.springai.semanticbooksearchlive.service;

import com.springai.semanticbooksearchlive.repository.BookContentRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookChatService {

    private final BookContentRepository repository;
    private final ChatClient chatClient;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Value("classpath:prompts/book-persona.st")
    private org.springframework.core.io.Resource systemPromptResource;

    public BookChatService(BookContentRepository repository, ChatClient.Builder builder) {
        this.repository = repository;
        this.chatClient = builder.build();
        this.restClient = RestClient.create();
    }

    public String chat(String bookId, String bookTitle, String message) {
        // 1. Retrieve relevant chunks for this specific book
        List<Document> similarDocs = repository.similaritySearch(bookId, message);
        String context = similarDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        if (context.isEmpty()) {
            return "I don't have enough information about this book to answer that.";
        }

        // 2. Construct System Prompt
        SystemPromptTemplate systemPrompt = new SystemPromptTemplate(systemPromptResource);
        Prompt prompt = new Prompt(List.of(
                systemPrompt.createMessage(Map.of("title", bookTitle, "context", context, "input", message)),
                new UserMessage(message)));

        // 3. Generate Response
        return chatClient.prompt(prompt).call().content();
    }

    public void loadDemoBook(String bookId, String title, String url) {
        // 1. Fetch Content
        String text = restClient.get().uri(url).retrieve().body(String.class);
        if (text == null || text.isEmpty()) {
            throw new RuntimeException("Failed to download book content");
        }

        // 2. Split into chunks
        TokenTextSplitter splitter = new TokenTextSplitter();
        List<Document> documents = splitter.split(new Document(text));

        // 3. Add Metadata
        documents.forEach(doc -> {
            doc.getMetadata().putAll(Map.of(
                    "book_id", bookId,
                    "title", title));
        });

        // 4. Store
        repository.add(documents);
    }
}
