package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.HybridSearchResponse;
import com.springai.semanticbooksearchlive.service.HybridSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hybrid-search")
public class HybridSearchController {

    private final HybridSearchService hybridSearchService;

    public HybridSearchController(HybridSearchService hybridSearchService) {
        this.hybridSearchService = hybridSearchService;
    }

    @GetMapping
    public HybridSearchResponse search(@RequestParam String query) {
        return hybridSearchService.search(query);
    }
}
