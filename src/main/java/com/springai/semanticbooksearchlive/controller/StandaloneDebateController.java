package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.debate.DebateRequest;
import com.springai.semanticbooksearchlive.model.debate.DebateResponse;
import com.springai.semanticbooksearchlive.service.debate.DebateFileService;
import com.springai.semanticbooksearchlive.service.debate.DebateOrchestratorService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/debate")
public class StandaloneDebateController {

    private final DebateFileService fileService;
    private final DebateOrchestratorService orchestratorService;

    public StandaloneDebateController(DebateFileService fileService, DebateOrchestratorService orchestratorService) {
        this.fileService = fileService;
        this.orchestratorService = orchestratorService;
    }

    @PostMapping("/upload")
    public Map<String, String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sessionId", required = false) String sessionId,
            @RequestParam("label") String label) throws IOException { // Label = "A" or "B"

        // Generate Session ID if new
        String activeSessionId = (sessionId == null || sessionId.isEmpty()) ? UUID.randomUUID().toString() : sessionId;

        String filename = fileService.uploadFile(file, activeSessionId, label);

        return Map.of(
                "sessionId", activeSessionId,
                "filename", filename,
                "message", "File uploaded successfully for contender " + label);
    }

    @PostMapping("/turn")
    public DebateResponse nextTurn(@RequestBody DebateRequest request) {
        return orchestratorService.processTurn(request);
    }
}
