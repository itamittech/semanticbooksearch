package com.springai.semanticbooksearchlive.service.study;

import com.springai.semanticbooksearchlive.model.Course;
import com.springai.semanticbooksearchlive.repository.study.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course createCourse(String name, String description) {
        return courseRepository.create(new Course(null, name, description));
    }

    public Course getCourse(UUID id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }
}
