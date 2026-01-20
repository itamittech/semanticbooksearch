package com.springai.semanticbooksearchlive.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.springai.semanticbooksearchlive.model.EvaluationResult;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;

@Service
public class EvaluationService {

    private final ChatClient chatClient;

    @Value("classpath:/prompts/evaluation-judge.st")
    private Resource evaluationPromptResource;

    public EvaluationService(ChatClient.Builder builder) {
        // We act as an independent judge, so we don't need the other tools
        this.chatClient = builder.build();
    }

    public EvaluationResult evaluateResponse(String userQuery, String aiResponse) {
        var converter = new BeanOutputConverter<>(EvaluationResult.class);
        try {
            return chatClient.prompt()
                    .user(u -> u.text(evaluationPromptResource)
                            .param("user_query", userQuery)
                            .param("ai_response", aiResponse)
                            .param("format", converter.getFormat()))
                    .call()
                    .entity(EvaluationResult.class);
        } catch (Exception e) {
            // Return a default error result
            return new EvaluationResult(0, 0, "Evaluation failed: " + e.getMessage());
        }
    }
}
