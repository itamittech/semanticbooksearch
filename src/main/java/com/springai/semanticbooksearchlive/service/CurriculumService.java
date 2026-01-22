package com.springai.semanticbooksearchlive.service;

import com.springai.semanticbooksearchlive.model.Book;
import com.springai.semanticbooksearchlive.model.CompareSearchResponse;
import com.springai.semanticbooksearchlive.model.Curriculum;
import com.springai.semanticbooksearchlive.model.SearchResult;
import com.springai.semanticbooksearchlive.service.book.BookService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CurriculumService {

    private final BookService bookService;
    private final TOCExtractorService tocExtractorService;
    private final ChatClient chatClient;

    @Value("classpath:prompts/system-curriculum-designer.st")
    private Resource systemPrompt;

    public CurriculumService(BookService bookService, TOCExtractorService tocExtractorService,
            ChatClient.Builder builder) {
        this.bookService = bookService;
        this.tocExtractorService = tocExtractorService;
        this.chatClient = builder.build();
    }

    public Curriculum generateCurriculum(String topic, String level, String duration) {
        // 1. Find relevant books (Semantic Search)
        // We ask for top 5 books to keep context window manageable
        CompareSearchResponse searchResponse = bookService.search(topic, "All", 5);
        List<Book> candidateBooks = searchResponse.semantic().stream()
                .map(SearchResult::book)
                .collect(Collectors.toList());

        // 2. Prepare Context with TOCs
        StringBuilder booksContext = new StringBuilder();
        for (Book book : candidateBooks) {
            List<String> toc = book.tableOfContents();

            // Lazy Load TOC if missing and URL exists
            if ((toc == null || toc.isEmpty()) && book.textUrl() != null && !book.textUrl().isBlank()) {
                System.out.println("Extracting TOC for: " + book.title());
                toc = tocExtractorService.extractChapters(book.textUrl());
                // Note: We are strictly using this for the prompt context, not saving back to
                // DB
                // yet to avoid transaction complexity in this flow.
            }

            booksContext.append("Book Title: ").append(book.title())
                    .append(" (ID: ").append(book.id()).append(")\n");

            if (toc != null && !toc.isEmpty()) {
                booksContext.append("Table of Contents:\n");
                toc.forEach(chapter -> booksContext.append("- ").append(chapter).append("\n"));
            } else {
                booksContext.append("Table of Contents: [Not Available - Use general knowledge of this book]\n");
            }
            booksContext.append("\n---\n");
        }

        // 3. Call AI
        return chatClient.prompt()
                .system(s -> s.text(systemPrompt)
                        .param("topic", topic)
                        .param("level", level)
                        .param("duration", duration)
                        .param("books_context", booksContext.toString()))
                .user("Please generate the curriculum.")
                .call()
                .entity(Curriculum.class);
    }
}
