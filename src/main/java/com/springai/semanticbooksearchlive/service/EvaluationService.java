package com.springai.semanticbooksearchlive.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EvaluationService {

    private final ChatClient chatClient;

    @org.springframework.beans.factory.annotation.Value("classpath:/prompts/evaluation-judge.st")
    private org.springframework.core.io.Resource evaluationPromptResource;

    public EvaluationService(ChatClient.Builder builder) {
        // We act as an independent judge, so we don't need the other tools
        this.chatClient = builder.build();
    }

    public Map<String, Object> evaluateResponse(String userQuery, String aiResponse) {
        try {
            return chatClient.prompt()
                    .user(u -> u.text(evaluationPromptResource)
                            .param("user_query", userQuery)
                            .param("ai_response", aiResponse))
                    .call()
                    .entity(Map.class);
        } catch (Exception e) {
            return Map.of(
                    "error", "Evaluation failed",
                    "details", e.getMessage());
        }
    }
}
