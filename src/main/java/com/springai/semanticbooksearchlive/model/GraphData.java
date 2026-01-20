package com.springai.semanticbooksearchlive.model;

import java.util.List;

public record GraphData(List<GraphNode> nodes, List<GraphLink> links) {
    public record GraphNode(String id, String label, String group, double val) {
    }

    public record GraphLink(String source, String target, double value) {
    }
}
