package com.springai.semanticbooksearchlive.model.debate;

public record DebateMessage(
        String sender, // "A" or "B"
        String content) {
}
