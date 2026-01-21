package com.springai.semanticbooksearchlive.controller.graph;

import com.springai.semanticbooksearchlive.model.GraphData;
import com.springai.semanticbooksearchlive.service.graph.KnowledgeGraphService;
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
