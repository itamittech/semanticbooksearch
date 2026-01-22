package com.springai.semanticbooksearchlive.model;

import java.util.List;

public record Module(int week, String topic, String description, List<ReadingAssignment> readings) {
}
