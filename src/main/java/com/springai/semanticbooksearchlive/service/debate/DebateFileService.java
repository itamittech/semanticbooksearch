package com.springai.semanticbooksearchlive.service.debate;

import com.springai.semanticbooksearchlive.repository.DebateContentRepository;
import org.apache.tika.Tika;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class DebateFileService {

    private final DebateContentRepository repository;
    private final Tika tika;
    private final TokenTextSplitter tokenTextSplitter;

    public DebateFileService(DebateContentRepository repository) {
        this.repository = repository;
        this.tika = new Tika();
        // Chunk size optimized for debate context
        this.tokenTextSplitter = new TokenTextSplitter();
    }

    public String uploadFile(MultipartFile file, String sessionId, String label) throws IOException {
        // 1. Parse Text
        String content;
        try (InputStream stream = file.getInputStream()) {
            content = tika.parseToString(stream);
        } catch (Exception e) { // Catch TikaException
            throw new RuntimeException("Failed to parse file", e);
        }

        if (content == null || content.isEmpty()) {
            throw new RuntimeException("Extracted content is empty for file: " + file.getOriginalFilename());
        }

        System.out.println("Extracted " + content.length() + " chars from " + file.getOriginalFilename());

        // 2. Split into segments
        List<Document> documents = tokenTextSplitter.split(new Document(content));

        // 3. Enrich with Debate Metadata
        documents.forEach(doc -> {
            doc.getMetadata().putAll(Map.of(
                    "session_id", sessionId,
                    "file_label", label,
                    "filename", file.getOriginalFilename()));
        });

        // 4. Store
        repository.add(documents);

        return file.getOriginalFilename();
    }
}
