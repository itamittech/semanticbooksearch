package com.springai.semanticbooksearchlive.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record EvaluationResult(
        @JsonProperty(required = true, value = "faithfulness_score") int faithfulnessScore,
        @JsonProperty(required = true, value = "relevance_score") int relevanceScore,
        @JsonProperty(required = true, value = "explanation") String explanation) {
}
