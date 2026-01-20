package com.springai.semanticbooksearchlive.model;

import java.util.List;

public record HybridSearchResponse(
        List<SearchResult> vectorResults,
        List<SearchResult> keywordResults,
        List<SearchResult> hybridResults) {
}
