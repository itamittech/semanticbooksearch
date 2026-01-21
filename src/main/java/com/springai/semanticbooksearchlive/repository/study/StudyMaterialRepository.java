package com.springai.semanticbooksearchlive.repository.study;

import com.springai.semanticbooksearchlive.model.StudyMaterial;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public class StudyMaterialRepository {
    private final JdbcClient jdbcClient;

    public StudyMaterialRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<StudyMaterial> findByCourseId(UUID courseId) {
        return jdbcClient.sql("SELECT * FROM study_materials WHERE course_id = :courseId ORDER BY upload_date DESC")
                .param("courseId", courseId)
                .query(StudyMaterial.class)
                .list();
    }

    public void save(StudyMaterial material) {
        jdbcClient.sql(
                "INSERT INTO study_materials (id, course_id, filename, type, upload_date) VALUES (:id, :courseId, :filename, :type, :uploadDate)")
                .param("id", material.id())
                .param("courseId", material.courseId())
                .param("filename", material.filename())
                .param("type", material.type())
                .param("uploadDate", material.uploadDate() != null ? material.uploadDate() : LocalDateTime.now())
                .update();
    }
}
