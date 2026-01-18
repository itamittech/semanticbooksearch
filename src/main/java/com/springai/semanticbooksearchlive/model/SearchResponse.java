package com.springai.semanticbooksearchlive.model;

import java.util.List;

public record SearchResponse(String query, int resultsFound, List<SearchResult> books) {
}
