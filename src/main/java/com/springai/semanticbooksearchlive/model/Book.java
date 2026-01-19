package com.springai.semanticbooksearchlive.model;

public record Book(String id, String title, String author, String summary, String genre, int publicationYear,
        String imageUrl) {
}
