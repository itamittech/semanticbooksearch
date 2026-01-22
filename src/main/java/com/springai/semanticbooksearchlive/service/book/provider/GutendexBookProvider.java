package com.springai.semanticbooksearchlive.service.book.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.springai.semanticbooksearchlive.model.Book;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GutendexBookProvider implements BookProvider {

    private final RestClient restClient;

    public GutendexBookProvider(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("https://gutendex.com").build();
    }

    @Override
    public List<Book> fetchBooks() {
        List<Book> allBooks = new java.util.ArrayList<>();
        String nextUrl = "/books";

        // Fetch up to 5 pages to get a decent catalog size (~160 books)
        for (int i = 0; i < 5; i++) {
            if (nextUrl == null)
                break;

            try {
                // Handle absolute or relative URLs from the API
                String uriToCall = nextUrl;
                if (nextUrl.startsWith("https://gutendex.com")) {
                    uriToCall = nextUrl.replace("https://gutendex.com", "");
                }

                GutendexResponse response = restClient.get()
                        .uri(uriToCall)
                        .retrieve()
                        .body(GutendexResponse.class);

                if (response == null || response.results == null) {
                    break;
                }

                allBooks.addAll(response.results.stream()
                        .map(this::mapToBook)
                        .collect(Collectors.toList()));

                nextUrl = response.next;
            } catch (Exception e) {
                System.err.println("Error fetching Gutendex page: " + e.getMessage());
                break;
            }
        }
        return allBooks;
    }

    private Book mapToBook(GutendexBook gBook) {
        String title = gBook.title != null ? gBook.title : "Unknown Title";
        String author = (gBook.authors != null && !gBook.authors.isEmpty())
                ? gBook.authors.get(0).name
                : "Unknown Author";
        String genre = (gBook.subjects != null && !gBook.subjects.isEmpty())
                ? gBook.subjects.get(0)
                : "General"; // Simple heuristic for genre
        // Clean up genre
        if (genre.contains(",")) {
            genre = genre.split(",")[0];
        }

        // Generate a valid UUID for our system, though we could store the Gutenberg ID
        // in metadata
        // For consistency in our DB, we'll generate a new UUID or use a deterministic
        // one if we want updates
        String id = UUID.nameUUIDFromBytes(("gutenberg-" + gBook.id).getBytes()).toString();

        String imageUrl = (gBook.formats != null && gBook.formats.image != null)
                ? gBook.formats.image
                : "https://placehold.co/400x600?text=" + title.replaceAll(" ", "%20");

        String summary = (gBook.summaries != null && !gBook.summaries.isEmpty())
                ? gBook.summaries.get(0)
                : "Project Gutenberg Book";

        String textUrl = null;
        if (gBook.formats != null) {
            if (gBook.formats.textUtf8 != null)
                textUrl = gBook.formats.textUtf8;
            else if (gBook.formats.textAscii != null)
                textUrl = gBook.formats.textAscii;
            else if (gBook.formats.textPlain != null)
                textUrl = gBook.formats.textPlain;
        }

        return new Book(
                id,
                title,
                author,
                summary,
                genre,
                0, // Year often not easily available in list, defaults to 0
                imageUrl,
                false,
                Collections.emptyList(),
                textUrl);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GutendexResponse {
        public String next;
        public List<GutendexBook> results;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GutendexBook {
        public int id;
        public String title;
        public List<Author> authors;
        public List<String> subjects;
        public List<String> summaries;
        public Formats formats;

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Author {
            public String name;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Formats {
            @JsonProperty("image/jpeg")
            public String image;
            @JsonProperty("text/plain; charset=utf-8")
            public String textUtf8;
            @JsonProperty("text/plain; charset=us-ascii")
            public String textAscii;
            @JsonProperty("text/plain")
            public String textPlain;
        }
    }
}
