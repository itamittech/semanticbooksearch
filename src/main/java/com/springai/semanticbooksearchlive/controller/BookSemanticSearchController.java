package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.Book;
import com.springai.semanticbooksearchlive.model.CompareSearchResponse;
import com.springai.semanticbooksearchlive.service.BookService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/books")
public class BookSemanticSearchController {

        private final BookService bookService;

        public BookSemanticSearchController(BookService bookService) {
                this.bookService = bookService;
        }

        @GetMapping("/all")
        public List<Book> getAllBooks() {
                return bookService.getAllBooks();
        }

        @PostMapping("/load")
        public String loadBooks() {
                return bookService.loadBooksToVectorStore();
        }

        @GetMapping("/genres")
        public Set<String> getGenres() {
                return bookService.getGenres();
        }

        @PostMapping
        public String addBook(@RequestBody Book book) {
                bookService.addBook(book);
                return "Book added successfully";
        }

        @PostMapping(value = "/chat", consumes = "multipart/form-data")
        public String chat(@RequestParam("query") String query,
                        @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {
                Resource imageResource = null;
                if (file != null && !file.isEmpty()) {
                        imageResource = new ByteArrayResource(file.getBytes());
                }
                return bookService.chat(query, imageResource);
        }

        @GetMapping("/search/compare")
        public CompareSearchResponse compareSearch(
                        @RequestParam String q,
                        @RequestParam(required = false) String genre,
                        @RequestParam(defaultValue = "3") int limit) {
                return bookService.search(q, genre, limit);
        }
}
