package com.springai.semanticbooksearchlive.model;

import java.util.List;

public record Curriculum(String topic, String level, List<Module> modules) {
}
