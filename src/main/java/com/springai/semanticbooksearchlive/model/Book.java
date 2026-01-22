package com.springai.semanticbooksearchlive.model;

public record Book(String id, String title, String author, String summary, String genre, int publicationYear,
                String imageUrl, boolean hasContent, java.util.List<String> tableOfContents, String textUrl) {
        public Book(String id, String title, String author, String summary, String genre, int publicationYear,
                        String imageUrl) {
                this(id, title, author, summary, genre, publicationYear, imageUrl, false, java.util.List.of(), null);
        }
}
