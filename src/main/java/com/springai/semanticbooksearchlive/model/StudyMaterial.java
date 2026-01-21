package com.springai.semanticbooksearchlive.model;

import java.util.UUID;
import java.time.LocalDateTime;

public record StudyMaterial(
        UUID id,
        UUID courseId,
        String filename,
        String type,
        LocalDateTime uploadDate) {
}
