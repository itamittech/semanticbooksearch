package com.springai.semanticbooksearchlive.model.debate;

import java.util.List;

public record DebateRequest(
        String sessionId,
        String topic,
        List<DebateMessage> history) {
}
