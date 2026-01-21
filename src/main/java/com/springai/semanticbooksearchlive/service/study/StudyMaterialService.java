package com.springai.semanticbooksearchlive.service.study;

import com.springai.semanticbooksearchlive.model.StudyMaterial;
import com.springai.semanticbooksearchlive.repository.study.StudyMaterialRepository;
import com.springai.semanticbooksearchlive.repository.study.StudyMaterialVectorRepository;
import org.apache.tika.Tika;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;
    private final StudyMaterialVectorRepository vectorRepository;
    private final Tika tika;

    public StudyMaterialService(StudyMaterialRepository studyMaterialRepository,
            StudyMaterialVectorRepository vectorRepository) {
        this.studyMaterialRepository = studyMaterialRepository;
        this.vectorRepository = vectorRepository;
        this.tika = new Tika();
    }

    public void ingestMaterial(UUID courseId, MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        String type = determineType(filename);
        String content = "";

        if ("PDF".equals(type) || "PPT".equals(type) || "DOC".equals(type)) {
            // Tika Auto-Detection
            try {
                content = tika.parseToString(file.getInputStream());
            } catch (Exception e) {
                throw new IOException("Failed to parse document content: " + e.getMessage(), e);
            }
        } else if ("IMAGE".equals(type)) {
            // TODO: Vision API integration later
            content = "Image content placeholder";
        }

        if (content == null || content.isBlank()) {
            throw new RuntimeException("Could not extract text from file");
        }

        // 1. Save Metadata
        UUID materialId = UUID.randomUUID();
        StudyMaterial material = new StudyMaterial(materialId, courseId, filename, type, LocalDateTime.now());
        studyMaterialRepository.save(material);

        // 2. Vector Store Ingestion
        TokenTextSplitter splitter = new TokenTextSplitter();
        List<Document> docs = splitter.split(new Document(content));

        // Add Metadata to each chunk
        for (Document doc : docs) {
            doc.getMetadata().putAll(Map.of(
                    "course_id", courseId.toString(),
                    "source_id", materialId.toString(),
                    "filename", filename,
                    "type", type));
        }

        vectorRepository.add(docs);
    }

    public List<StudyMaterial> getMaterialsForCourse(UUID courseId) {
        return studyMaterialRepository.findByCourseId(courseId);
    }

    private String determineType(String filename) {
        if (filename == null)
            return "UNKNOWN";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf"))
            return "PDF";
        if (lower.endsWith(".ppt") || lower.endsWith(".pptx"))
            return "PPT";
        if (lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg"))
            return "IMAGE";
        return "DOC";
    }
}
