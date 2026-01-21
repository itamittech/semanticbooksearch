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
public class StudyMaterialVectorRepository {

    private final JdbcClient jdbcClient;
    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    public StudyMaterialVectorRepository(JdbcClient jdbcClient, EmbeddingModel embeddingModel,
            ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.embeddingModel = embeddingModel;
        this.objectMapper = objectMapper;
    }

    public List<Document> similaritySearch(String courseId, String query) {
        float[] embedding = embeddingModel.embed(query);

        // Note: Casting courseId to text inside metadata JSON check, or ensure metadata
        // stores it as string
        String sql = """
                SELECT content, metadata
                FROM study_material_vector_store
                WHERE (metadata->>'course_id') = :courseId
                ORDER BY embedding <=> :embedding::vector
                LIMIT 5
                """;

        return jdbcClient.sql(sql)
                .param("courseId", courseId)
                .param("embedding", java.util.Arrays.toString(embedding))
                .query((rs, rowNum) -> {
                    String content = rs.getString("content");
                    String metadataJson = rs.getString("metadata");
                    Map<String, Object> metadata = parseMetadata(metadataJson);
                    return new Document(content, metadata);
                })
                .list();
    }

    public void add(List<Document> documents) {
        String sql = "INSERT INTO study_material_vector_store (content, metadata, embedding) VALUES (:content, :metadata::json, :embedding::vector)";

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

    private Map<String, Object> parseMetadata(String json) {
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return Map.of();
        }
    }
}
