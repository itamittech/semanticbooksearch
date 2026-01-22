package com.springai.semanticbooksearchlive.model;

public record Book(String id, String title, String author, String summary, String genre, int publicationYear,
                String imageUrl, boolean hasContent) {
        public Book(String id, String title, String author, String summary, String genre, int publicationYear,
                        String imageUrl) {
                this(id, title, author, summary, genre, publicationYear, imageUrl, false);
        }
}
