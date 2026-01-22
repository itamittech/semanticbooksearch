package com.springai.semanticbooksearchlive.service.search;

import com.springai.semanticbooksearchlive.model.Book;
import com.springai.semanticbooksearchlive.model.HybridSearchResponse;
import com.springai.semanticbooksearchlive.model.SearchResult;
import com.springai.semanticbooksearchlive.repository.search.KeywordSearchRepository;
import com.springai.semanticbooksearchlive.util.RankFusionUtils;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HybridSearchService {

    private final VectorStore vectorStore;
    private final KeywordSearchRepository keywordRepository;

    public HybridSearchService(VectorStore vectorStore, KeywordSearchRepository keywordRepository) {
        this.vectorStore = vectorStore;
        this.keywordRepository = keywordRepository;
    }

    public HybridSearchResponse search(String query) {
        // 1. Run Vector Search
        List<Document> vectorDocs = vectorStore.similaritySearch(
                SearchRequest.builder().query(query).topK(10).build());

        // 2. Run Keyword Search
        List<Document> keywordDocs = keywordRepository.search(query);

        // 3. Fuse Results
        List<Document> hybridDocs = RankFusionUtils.fuse(vectorDocs, keywordDocs);

        // 4. Convert to DTOs
        return new HybridSearchResponse(
                mapToSearchResults(vectorDocs),
                mapToSearchResults(keywordDocs),
                mapToSearchResults(hybridDocs));
    }

    private List<SearchResult> mapToSearchResults(List<Document> documents) {
        return documents.stream()
                .map(doc -> {
                    Map<String, Object> metadata = doc.getMetadata();
                    Book book = new Book(
                            (String) metadata.getOrDefault("id", ""),
                            (String) metadata.getOrDefault("title", ""),
                            (String) metadata.getOrDefault("author", ""),
                            doc.getText(), // Content
                            (String) metadata.getOrDefault("genre", ""),
                            metadata.containsKey("publicationYear")
                                    ? ((Number) metadata.get("publicationYear")).intValue()
                                    : 0,
                            (String) metadata.getOrDefault("imageUrl", ""),
                            false,
                            java.util.Collections.emptyList(),
                            null);

                    // For hybrid search, we might not have a pure distance score for all items,
                    // so we default to 1.0 or calculate based on rank if needed.
                    // Here we check if distance exists (Vector search)
                    // Calculate Score safely
                    double score = 0.0;
                    if (metadata.containsKey("rrf_score")) {
                        Object rrfObj = metadata.get("rrf_score");
                        if (rrfObj instanceof Number) {
                            score = ((Number) rrfObj).doubleValue();
                        }
                    } else if (metadata.containsKey("distance")) {
                        Object distObj = metadata.get("distance");
                        if (distObj instanceof Number) {
                            // Convert distance to similarity (1 - distance)
                            // Note: This relies on using Cosine Similarity where distance = 1 - cosine
                            score = 1.0 - ((Number) distObj).doubleValue();
                        }
                    } else if (metadata.containsKey("score")) {
                        // Some vector stores might return 'score' directly
                        Object scoreObj = metadata.get("score");
                        if (scoreObj instanceof Number) {
                            score = ((Number) scoreObj).doubleValue();
                        }
                    }

                    return new SearchResult(book, score);
                })
                .collect(Collectors.toList());
    }
}
