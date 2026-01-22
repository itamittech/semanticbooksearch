package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.Curriculum;
import com.springai.semanticbooksearchlive.service.CurriculumService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/curriculum")
@CrossOrigin(origins = "*") // Allow frontend access
public class CurriculumController {

    private final CurriculumService curriculumService;

    public CurriculumController(CurriculumService curriculumService) {
        this.curriculumService = curriculumService;
    }

    public record CurriculumRequest(String topic, String level, String duration) {
    }

    @PostMapping("/generate")
    public Curriculum generate(@RequestBody CurriculumRequest request) {
        return curriculumService.generateCurriculum(request.topic(), request.level(), request.duration());
    }
}
