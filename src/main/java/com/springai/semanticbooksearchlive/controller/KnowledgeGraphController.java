package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.GraphData;
import com.springai.semanticbooksearchlive.service.KnowledgeGraphService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/graph")
public class KnowledgeGraphController {

    private final KnowledgeGraphService graphService;

    public KnowledgeGraphController(KnowledgeGraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/data")
    public GraphData getGraphData() {
        return graphService.getGraphData();
    }
}
