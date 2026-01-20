package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.EvaluationResult;
import com.springai.semanticbooksearchlive.service.EvaluationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final EvaluationService evaluationService;

    public ChatController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    record EvaluationRequest(String userQuery, String aiResponse) {
    }

    @PostMapping("/evaluate")
    public EvaluationResult evaluate(@RequestBody EvaluationRequest request) {
        return evaluationService.evaluateResponse(request.userQuery(), request.aiResponse());
    }
}
