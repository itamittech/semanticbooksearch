package com.springai.semanticbooksearchlive.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TOCExtractorService {

    private final RestClient restClient;
    // Regex looking for "Chapter 1", "Part I", "Book One", or all caps "CHAPTER 1"
    private final Pattern CHAPTER_PATTERN = Pattern.compile(
            "^(?i)(Chapter|Part|Book|Volume)\\s+([IVXLCDM\\d]+|[A-Z][a-z]+|One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten).*$",
            Pattern.MULTILINE);

    public TOCExtractorService(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    public List<String> extractChapters(String textUrl) {
        if (textUrl == null || textUrl.isBlank()) {
            return List.of();
        }

        try {
            // Fetch first 15KB to catch most TOCs or initial chapters
            // Note: Gutendex URLs might accept Range header, or we stream.
            // For simplicity and speed in this demo, accessing the URL and limiting string
            // size.
            String content = restClient.get()
                    .uri(textUrl)
                    .retrieve()
                    .body(String.class);

            if (content == null)
                return List.of();

            // Truncate to first 20000 characters to save processing and ensure we get the
            // TOC/start
            String preview = content.length() > 20000 ? content.substring(0, 20000) : content;

            List<String> chapters = new ArrayList<>();
            Matcher matcher = CHAPTER_PATTERN.matcher(preview);

            while (matcher.find()) {
                String line = matcher.group(0).trim();
                // Avoid tiny noise matches or massive lines
                if (line.length() > 5 && line.length() < 100) {
                    chapters.add(line);
                }
            }

            // Fallback: If no chapters found, fallback to "Section 1..N" based on chunks?
            // Or just return empty and let the LLM handle "Whole Book" logic.
            return chapters;

        } catch (Exception e) {
            System.err.println("Failed to extract TOC from " + textUrl + ": " + e.getMessage());
            return List.of();
        }
    }
}
