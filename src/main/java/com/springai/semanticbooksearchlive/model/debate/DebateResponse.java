package com.springai.semanticbooksearchlive.model.debate;

import java.util.List;

public record DebateResponse(
        String speaker, // "A" or "B"
        String content,
        List<DebateMessage> updatedHistory) {
}
