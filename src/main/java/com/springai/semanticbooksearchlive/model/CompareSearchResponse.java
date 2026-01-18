package com.springai.semanticbooksearchlive.model;

import java.util.List;

public record CompareSearchResponse(List<SearchResult> semantic, List<SearchResult> keyword) {
}
