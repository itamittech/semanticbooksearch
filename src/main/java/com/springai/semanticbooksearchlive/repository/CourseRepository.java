package com.springai.semanticbooksearchlive.repository;

import com.springai.semanticbooksearchlive.model.Course;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class CourseRepository {
    private final JdbcClient jdbcClient;

    public CourseRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<Course> findAll() {
        return jdbcClient.sql("SELECT * FROM courses")
                .query(Course.class)
                .list();
    }

    public Optional<Course> findById(UUID id) {
        return jdbcClient.sql("SELECT * FROM courses WHERE id = :id")
                .param("id", id)
                .query(Course.class)
                .optional();
    }

    public Course create(Course course) {
        if (course.id() == null) {
            // Let DB generate UUID if null, but usually we ignore it in insert if default
            // But if we want to return the ID, we might need RETURNING or generate java
            // side
            UUID newId = UUID.randomUUID();
            jdbcClient.sql("INSERT INTO courses (id, name, description) VALUES (:id, :name, :description)")
                    .param("id", newId)
                    .param("name", course.name())
                    .param("description", course.description())
                    .update();
            return new Course(newId, course.name(), course.description());
        } else {
            jdbcClient.sql("INSERT INTO courses (id, name, description) VALUES (:id, :name, :description)")
                    .param("id", course.id())
                    .param("name", course.name())
                    .param("description", course.description())
                    .update();
            return course;
        }
    }
}
