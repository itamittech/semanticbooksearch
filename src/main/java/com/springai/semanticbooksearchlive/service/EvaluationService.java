package com.springai.semanticbooksearchlive.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EvaluationService {

    private final ChatClient chatClient;

    public EvaluationService(ChatClient.Builder builder) {
        // We act as an independent judge, so we don't need the other tools
        this.chatClient = builder.build();
    }

    public Map<String, Object> evaluateResponse(String userQuery, String aiResponse) {
        String evaluationPrompt = """
                You are an impartial AI Judge. Evaluate the following AI Response to the User Query.

                User Query: "%s"
                AI Response: "%s"

                Criteria:
                1. FAITHFULNESS (0-5): Is the answer grounded in reality?
                2. RELEVANCE (0-5): Did it directly answer the user's question?

                Return ONLY a JSON object:
                {
                    "faithfulness_score": 0,
                    "relevance_score": 0,
                    "explanation": "Short reason"
                }
                """.formatted(userQuery, aiResponse);

        try {
            return chatClient.prompt()
                    .user(evaluationPrompt)
                    .call()
                    .entity(Map.class);
        } catch (Exception e) {
            return Map.of(
                    "error", "Evaluation failed",
                    "details", e.getMessage());
        }
    }
}
