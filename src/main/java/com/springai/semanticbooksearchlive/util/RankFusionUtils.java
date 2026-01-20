package com.springai.semanticbooksearchlive.util;

import org.springframework.ai.document.Document;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class for implementing Reciprocal Rank Fusion (RRF).
 * <p>
 * RRF is an algorithm for combining the results of multiple search strategies
 * (e.g., Vector Search + Keyword Search)
 * into a single unified ranking. It is particularly effective because it does
 * not require tuning weights for
 * different scores; it relies solely on the rank of items in each result list.
 * </p>
 *
 * <h3>The Algorithm</h3>
 * The RRF score for a document \( d \) is calculated as:
 * 
 * <pre>
 * RRFscore(d) = \sum_{r \in R} \frac{1}{k + r(d)}
 * </pre>
 * 
 * Where:
 * <ul>
 * <li>\( R \) is the set of rank lists (e.g., one from vector search, one from
 * keyword search).</li>
 * <li>\( r(d) \) is the rank (1-based position) of document \( d \) in list \(
 * r \).</li>
 * <li>\( k \) is a constant that mitigates the impact of high rankings by
 * outliers. a value of 60 is standard in the industry (based on the original
 * paper).</li>
 * </ul>
 *
 * <h3>Why is this custom?</h3>
 * As of Spring AI 1.1.2, there is no built-in `ReciprocalRankFusion`
 * implementation that directly supports
 * merging results from PGVector (VectorStore) and a custom JDBC keyword search.
 * This class fills that gap
 * by providing a standard implementation of the algorithm.
 */
public class RankFusionUtils {

    private static final int K = 60; // Standard constant from the original RRF paper

    /**
     * Fuses multiple lists of documents using Reciprocal Rank Fusion.
     *
     * @param vectorResults  Results from the semantic (vector) search.
     * @param keywordResults Results from the exact match (keyword/full-text)
     *                       search.
     * @return A re-ranked list of documents containing the best from both worlds.
     */
    public static List<Document> fuse(List<Document> vectorResults, List<Document> keywordResults) {
        Map<String, Double> scoreMap = new HashMap<>();
        Map<String, Document> documentMap = new HashMap<>();

        // 1. Process Vector Results
        processList(vectorResults, scoreMap, documentMap);

        // 2. Process Keyword Results
        processList(keywordResults, scoreMap, documentMap);

        // 3. Sort by RRF Score (Descending) and return Documents
        return scoreMap.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(entry -> {
                    Document doc = documentMap.get(entry.getKey());
                    if (doc != null) {
                        try {
                            doc.getMetadata().put("rrf_score", entry.getValue());
                        } catch (UnsupportedOperationException e) {
                            // If metadata is immutable, create a new mutable map and document
                            Map<String, Object> newMeta = new HashMap<>(doc.getMetadata());
                            newMeta.put("rrf_score", entry.getValue());
                            return new Document(doc.getId(), doc.getText(), newMeta);
                        }
                    }
                    return doc;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private static void processList(List<Document> documents, Map<String, Double> scoreMap,
            Map<String, Document> documentMap) {
        for (int i = 0; i < documents.size(); i++) {
            Document doc = documents.get(i);
            String id = doc.getId();

            // Store the document content if we haven't seen it yet
            documentMap.putIfAbsent(id, doc);

            // Calculate RRF score component for this rank
            // Rank is 1-based (i + 1)
            double score = 1.0 / (K + (i + 1));

            // Add to total score
            scoreMap.merge(id, score, Double::sum);
        }
    }
}
