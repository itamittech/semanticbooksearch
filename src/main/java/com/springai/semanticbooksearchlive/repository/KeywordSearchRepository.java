package com.springai.semanticbooksearchlive.repository;

import org.springframework.ai.document.Document;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Repository
public class KeywordSearchRepository {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    public KeywordSearchRepository(JdbcClient jdbcClient, ObjectMapper objectMapper) {
        this.jdbcClient = jdbcClient;
        this.objectMapper = objectMapper;
    }

    public List<Document> search(String query) {
        String sql = """
                SELECT id, content, metadata
                FROM vector_store
                WHERE content_search @@ plainto_tsquery('english', :query)
                LIMIT 10
                """;

        return jdbcClient.sql(sql)
                .param("query", query)
                .query((rs, rowNum) -> {
                    String id = rs.getString("id");
                    String content = rs.getString("content");
                    String metadataJson = rs.getString("metadata");
                    Map<String, Object> metadata = parseMetadata(metadataJson);

                    return new Document(id, content, metadata);
                })
                .list();
    }

    private Map<String, Object> parseMetadata(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            return Map.of();
        }
    }
}
