package com.springai.semanticbooksearchlive.service;

import com.springai.semanticbooksearchlive.repository.StudyMaterialVectorRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    private final StudyMaterialVectorRepository vectorRepository;
    private final ChatClient chatClient;

    @Value("classpath:prompts/teacher-persona.st")
    private Resource teacherPromptResource;

    @Value("classpath:prompts/quiz-generator.st")
    private Resource quizPromptResource;

    @Value("classpath:prompts/flashcard-generator.st")
    private Resource flashcardPromptResource;

    public TeacherService(StudyMaterialVectorRepository vectorRepository, ChatClient.Builder builder) {
        this.vectorRepository = vectorRepository;
        this.chatClient = builder.build();
    }

    public String chat(String courseId, String message) {
        // 1. RAG: Retrieve context
        List<Document> similarDocs = vectorRepository.similaritySearch(courseId, message);
        String context = similarDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        // 2. Prompt
        SystemPromptTemplate systemPrompt = new SystemPromptTemplate(teacherPromptResource);
        Prompt prompt = new Prompt(List.of(
                systemPrompt.createMessage(Map.of("context", context, "input", message)),
                new UserMessage(message)));

        // 3. Response
        return chatClient.prompt(prompt).call().content();
    }

    public String generateQuiz(String courseId, String topic) {
        // 1. RAG: Retrieve wider context for quiz
        // We might want to fetch more docs or generic search for topic
        List<Document> similarDocs = vectorRepository.similaritySearch(courseId, topic);
        String context = similarDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        SystemPromptTemplate systemPrompt = new SystemPromptTemplate(quizPromptResource);
        Prompt prompt = new Prompt(List.of(
                systemPrompt.createMessage(Map.of("context", context, "topic", topic, "num_questions", 5))));

        return chatClient.prompt(prompt).call().content();
    }

    public String generateFlashcards(String courseId) {
        // 1. RAG: Retrieve generic context (maybe just latest uploads?)
        // For now, let's search for "summary key concepts"
        List<Document> similarDocs = vectorRepository.similaritySearch(courseId, "important definitions and concepts");
        String context = similarDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        SystemPromptTemplate systemPrompt = new SystemPromptTemplate(flashcardPromptResource);
        Prompt prompt = new Prompt(List.of(
                systemPrompt.createMessage(Map.of("context", context))));

        return chatClient.prompt(prompt).call().content();
    }
}
