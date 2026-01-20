package com.springai.semanticbooksearchlive.service;

import com.springai.semanticbooksearchlive.model.GraphData;
import com.springai.semanticbooksearchlive.repository.KeywordSearchRepository;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KnowledgeGraphService {

    private final KeywordSearchRepository repository;

    public KnowledgeGraphService(KeywordSearchRepository repository) {
        this.repository = repository;
    }

    public GraphData getGraphData() {
        // 1. Fetch all documents with raw embeddings
        List<Document> documents = repository.findAllWithEmbeddings();
        List<GraphData.GraphNode> nodes = new ArrayList<>();
        List<GraphData.GraphLink> links = new ArrayList<>();

        // 2. Parse Embeddings & Create Nodes
        List<double[]> embeddings = new ArrayList<>();

        for (Document doc : documents) {
            String title = (String) doc.getMetadata().getOrDefault("title", "Unknown Title");
            String genre = (String) doc.getMetadata().getOrDefault("genre", "Unknown Genre");
            String id = (String) doc.getMetadata().getOrDefault("id", doc.getId()); // Use book ID from metadata if
                                                                                    // avail

            nodes.add(new GraphData.GraphNode(
                    id,
                    title,
                    genre,
                    1.0));

            // Parse vector string "[0.01, -0.2, ...]"
            String embStr = (String) doc.getMetadata().get("embedding_raw");
            if (embStr != null) {
                // Remove brackets and split
                String clean = embStr.replaceAll("[\\[\\]]", "");
                if (!clean.isBlank()) {
                    double[] vector = Arrays.stream(clean.split(","))
                            .mapToDouble(Double::parseDouble)
                            .toArray();
                    embeddings.add(vector);
                } else {
                    embeddings.add(null);
                }
            } else {
                embeddings.add(null);
            }
        }

        // 3. Compute Cosine Similarity & Create Links
        double similarityThreshold = 0.50; // Lowered to ensure connections appear

        for (int i = 0; i < nodes.size(); i++) {
            double[] vec1 = embeddings.get(i);
            if (vec1 == null)
                continue;

            for (int j = i + 1; j < nodes.size(); j++) {
                double[] vec2 = embeddings.get(j);
                if (vec2 == null)
                    continue;

                double similarity = cosineSimilarity(vec1, vec2);

                // Only link if highly similar
                if (similarity > similarityThreshold) {
                    links.add(new GraphData.GraphLink(
                            nodes.get(i).id(),
                            nodes.get(j).id(),
                            similarity // Use similarity as value (stronger link)
                    ));
                }
            }
        }

        return new GraphData(nodes, links);
    }

    private double cosineSimilarity(double[] vecA, double[] vecB) {
        if (vecA.length != vecB.length)
            return 0.0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += Math.pow(vecA[i], 2);
            normB += Math.pow(vecB[i], 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
