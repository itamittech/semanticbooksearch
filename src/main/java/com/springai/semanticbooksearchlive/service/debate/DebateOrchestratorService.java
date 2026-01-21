package com.springai.semanticbooksearchlive.service.debate;

import com.springai.semanticbooksearchlive.model.debate.DebateMessage;
import com.springai.semanticbooksearchlive.model.debate.DebateRequest;
import com.springai.semanticbooksearchlive.model.debate.DebateResponse;
import com.springai.semanticbooksearchlive.repository.DebateContentRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import java.util.Map;

@Service
public class DebateOrchestratorService {

    private final DebateContentRepository repository;
    private final ChatClient chatClient;

    @Value("classpath:prompts/debate-system.st")
    private Resource debateSystemPromptResource;

    public DebateOrchestratorService(DebateContentRepository repository, ChatClient.Builder builder) {
        this.repository = repository;
        this.chatClient = builder.build();
    }

    public DebateResponse processTurn(DebateRequest request) {
        // 1. Determine Speaker (A starts, then alternates)
        String currentSpeaker = determineNextSpeaker(request.history());

        // 2. Identify Last Argument (to rebut)
        String lastArgument = "This is the opening statement. State your position firmly.";
        if (!request.history().isEmpty()) {
            DebateMessage lastMsg = request.history().get(request.history().size() - 1);
            lastArgument = lastMsg.content();
        }

        // 3. Retrieve Context (RAG)
        // We search for the *current topic* or the *last argument* in the current
        // speaker's file
        String query = request.topic() + " " + lastArgument;
        List<Document> docs = repository.similaritySearch(request.sessionId(), currentSpeaker, query);

        String context = docs.stream().map(Document::getText).collect(Collectors.joining("\n\n"));
        if (context.isEmpty()) {
            context = "No specific text found in the document for this point. Use general knowledge about the document's theme.";
        }

        // 4. Construct Prompt
        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(debateSystemPromptResource);
        Message systemMessage = systemPromptTemplate.createMessage(Map.of(
                "speaker", currentSpeaker,
                "topic", request.topic(),
                "context", context));

        // 5. Context Window Management (Sliding Window)
        // We only append the last 6 messages to the prompt to avoid token overflow
        List<DebateMessage> recentHistory = getRecentHistory(request.history(), 6);
        StringBuilder conversationText = new StringBuilder();
        for (DebateMessage msg : recentHistory) {
            conversationText.append(msg.sender()).append(": ").append(msg.content()).append("\n");
        }

        UserMessage userMessage = new UserMessage(
                "OPPONENT ARGUMENT:\n" + lastArgument + "\n\n(Respond as " + currentSpeaker + ")");

        Prompt prompt = new Prompt(List.of(
                systemMessage,
                new SystemMessage("CURRENT CONVERSATION CONTEXT:\n" + conversationText.toString()),
                userMessage));

        // 6. Call LLM
        String responseContent = chatClient.prompt(prompt).call().content();

        // 7. Update History (Frontend handles state, but we return the logically next
        // state)
        // Ideally we just return the new message, and frontend appends it.
        // But the Record expects 'updatedHistory'.
        // For simplicity, we won't modify the input list, just return the response
        // details.

        return new DebateResponse(currentSpeaker, responseContent, request.history());
        // Note: Actual appending happens in frontend or we can append here if we want
        // backend to be authoritative.
    }

    private String determineNextSpeaker(List<DebateMessage> history) {
        if (history == null || history.isEmpty()) {
            return "A";
        }
        String lastSpeaker = history.get(history.size() - 1).sender();
        return lastSpeaker.equals("A") ? "B" : "A";
    }

    private List<DebateMessage> getRecentHistory(List<DebateMessage> history, int limit) {
        if (history == null)
            return List.of();
        if (history.size() <= limit)
            return history;
        return history.subList(history.size() - limit, history.size());
    }
}
