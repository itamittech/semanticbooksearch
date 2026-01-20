package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.service.BookChatService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookChatController {

    private final BookChatService bookChatService;
    private final com.springai.semanticbooksearchlive.service.BookService bookService;

    public BookChatController(BookChatService bookChatService,
            com.springai.semanticbooksearchlive.service.BookService bookService) {
        this.bookChatService = bookChatService;
        this.bookService = bookService;
    }

    @PostMapping("/{id}/chat/content")
    public String chatWithBook(
            @PathVariable String id,
            @RequestParam String title,
            @RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        return bookChatService.chat(id, title, message);
    }

    @PostMapping("/load-demo")
    public String loadDemoBook() {
        // Alice in Wonderland from Project Gutenberg
        String demoBookId = "demo-alice";
        String demoTitle = "Alice's Adventures in Wonderland";
        String url = "https://www.gutenberg.org/files/11/11-0.txt";

        try {
            // 1. Load Content into Dedicated Vector Store
            bookChatService.loadDemoBook(demoBookId, demoTitle, url);

            // 2. Register Book in Main Library (so it appears in UI)
            bookService.addBook(new com.springai.semanticbooksearchlive.model.Book(
                    demoBookId,
                    demoTitle,
                    "Lewis Carroll",
                    "Alice's Adventures in Wonderland (Demo Book with Deep RAG enabled)",
                    "Fantasy",
                    1865,
                    "https://placehold.co/400x600?text=Alice"));

            return "Successfully loaded demo book: " + demoTitle;
        } catch (Exception e) {
            return "Failed to load demo book: " + e.getMessage();
        }
    }
}
