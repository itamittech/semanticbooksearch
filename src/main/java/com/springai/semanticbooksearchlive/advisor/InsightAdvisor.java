package com.springai.semanticbooksearchlive.advisor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.ChatResponse;

/**
 * A Custom Spring AI Advisor that captures the "Thinking Process" of the AI.
 */
public class InsightAdvisor implements CallAdvisor {

    private static final String ADVISOR_NAME = "InsightAdvisor";
    private static final Logger logger = LoggerFactory.getLogger(InsightAdvisor.class);

    @Override
    public String getName() {
        return ADVISOR_NAME;
    }

    @Override
    public int getOrder() {
        return 0;
    }

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        long startTime = System.currentTimeMillis();

        // 1. Capture Request context
        String userText = "N/A";
        try {
            if (request.prompt() != null) {
                userText = request.prompt().getContents();
            }
        } catch (Exception e) {
            logger.warn("Could not extract user text", e);
        }

        // 2. Proceed with the call
        ChatClientResponse response = chain.nextCall(request);

        long duration = System.currentTimeMillis() - startTime;

        // 3. Inject Insights (Logging for now)
        if (response != null && response.chatResponse() != null) {
            ChatResponse chatResponse = response.chatResponse();

            if (!chatResponse.getResults().isEmpty()) {
                logger.info("AI Insight - Time: {}ms, Model: {}", duration, chatResponse.getMetadata().getModel());
            }
        }

        return response;
    }
}
