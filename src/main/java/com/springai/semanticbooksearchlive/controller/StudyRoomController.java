package com.springai.semanticbooksearchlive.controller;

import com.springai.semanticbooksearchlive.model.Course;
import com.springai.semanticbooksearchlive.model.StudyMaterial;
import com.springai.semanticbooksearchlive.service.CourseService;
import com.springai.semanticbooksearchlive.service.StudyMaterialService;
import com.springai.semanticbooksearchlive.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/study-room")
public class StudyRoomController {

    private final CourseService courseService;
    private final StudyMaterialService studyMaterialService;
    private final TeacherService teacherService;

    public StudyRoomController(CourseService courseService, StudyMaterialService studyMaterialService,
            TeacherService teacherService) {
        this.courseService = courseService;
        this.studyMaterialService = studyMaterialService;
        this.teacherService = teacherService;
    }

    // --- COURSES ---
    @GetMapping("/courses")
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @PostMapping("/courses")
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course.name(), course.description());
    }

    @GetMapping("/courses/{id}")
    public Course getCourse(@PathVariable UUID id) {
        return courseService.getCourse(id);
    }

    // --- MATERIALS ---
    @PostMapping("/courses/{courseId}/materials")
    public ResponseEntity<?> uploadMaterial(@PathVariable UUID courseId, @RequestParam("file") MultipartFile file) {
        try {
            studyMaterialService.ingestMaterial(courseId, file);
            return ResponseEntity.ok(Map.of("message", "Material uploaded successfully"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses/{courseId}/materials")
    public List<StudyMaterial> getMaterials(@PathVariable UUID courseId) {
        return studyMaterialService.getMaterialsForCourse(courseId);
    }

    // --- TEACHER TOOLS ---
    @PostMapping("/courses/{courseId}/chat")
    public Map<String, String> chat(@PathVariable String courseId, @RequestBody Map<String, String> payload) {
        String response = teacherService.chat(courseId, payload.get("message"));
        return Map.of("response", response);
    }

    @PostMapping("/courses/{courseId}/quiz")
    public String generateQuiz(@PathVariable String courseId, @RequestBody Map<String, String> payload) {
        // Return raw JSON string from LLM
        return teacherService.generateQuiz(courseId, payload.getOrDefault("topic", "general"));
    }

    @PostMapping("/courses/{courseId}/flashcards")
    public String generateFlashcards(@PathVariable String courseId) {
        // Return raw JSON string from LLM
        return teacherService.generateFlashcards(courseId);
    }
}
