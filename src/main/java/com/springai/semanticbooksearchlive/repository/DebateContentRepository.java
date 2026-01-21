package com.springai.semanticbooksearchlive.repository;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
public class DebateContentRepository {

    private final JdbcClient jdbcClient;
    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    public DebateContentRepository(JdbcClient jdbcClient, EmbeddingModel embeddingModel, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.embeddingModel = embeddingModel;
        this.objectMapper = objectMapper;
    }

    public void add(List<Document> documents) {
        String sql = "INSERT INTO debate_vector_store (content, metadata, embedding) VALUES (:content, :metadata::json, :embedding::vector)";

        for (Document doc : documents) {
            float[] embedding = embeddingModel.embed(doc.getText());
            try {
                String metadataJson = objectMapper.writeValueAsString(doc.getMetadata());
                jdbcClient.sql(sql)
                        .param("content", doc.getText())
                        .param("metadata", metadataJson)
                        .param("embedding", java.util.Arrays.toString(embedding))
                        .update();
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize metadata", e);
            }
        }
    }

    public List<Document> similaritySearch(String sessionId, String fileLabel, String query) {
        float[] embedding = embeddingModel.embed(query);
        System.out.println("Searching debate content for session: " + sessionId + ", label: " + fileLabel);
        String sql = """
                SELECT content, metadata
                FROM debate_vector_store
                WHERE (metadata->>'session_id') = :sessionId
                AND (metadata->>'file_label') = :fileLabel
                ORDER BY embedding <=> :embedding::vector
                LIMIT 3
                """;

        return jdbcClient.sql(sql)
                .param("sessionId", sessionId)
                .param("fileLabel", fileLabel)
                .param("embedding", java.util.Arrays.toString(embedding))
                .query((rs, rowNum) -> {
                    String content = rs.getString("content");
                    String metadataJson = rs.getString("metadata");
                    Map<String, Object> metadata = parseMetadata(metadataJson);
                    return new Document(content, metadata);
                })
                .list();
    }

    private Map<String, Object> parseMetadata(String json) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> map = objectMapper.readValue(json, Map.class);
            return map;
        } catch (Exception e) {
            return Map.of();
        }
    }
}
