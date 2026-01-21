CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS vector_store (
	id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	content text,
	metadata json,
	embedding vector(1536)
);

-- Idempotent column addition: Add content_search if it doesn't exist
ALTER TABLE vector_store ADD COLUMN IF NOT EXISTS content_search tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Idempotent index creation
CREATE INDEX IF NOT EXISTS idx_vector_store_embedding ON vector_store USING HNSW (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_vector_store_content_search ON vector_store USING GIN(content_search);

-- TALK TO BOOK FEATURE --
-- Separate table for storing detailed book content chunks
CREATE TABLE IF NOT EXISTS book_content_vector_store (
	id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	content text,
	metadata json,
	embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_book_content_vector_store_embedding ON book_content_vector_store USING HNSW (embedding vector_cosine_ops);

-- STUDY ROOM FEATURE --
-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text
);

-- Separate vector store for study materials (strictly scoped by course)
CREATE TABLE IF NOT EXISTS study_material_vector_store (
	id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	content text,
	metadata json,
	embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_study_material_vector_store_embedding ON study_material_vector_store USING HNSW (embedding vector_cosine_ops);

-- Study Material Metadata Table (for listing files in a course)
CREATE TABLE IF NOT EXISTS study_materials (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id uuid NOT NULL REFERENCES courses(id),
    filename text NOT NULL,
    type text NOT NULL,
    upload_date timestamp DEFAULT CURRENT_TIMESTAMP
);



-- STANDALONE DEBATE FEATURE --
-- Temporary table for ad-hoc file uploads
CREATE TABLE IF NOT EXISTS debate_vector_store (
	id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
	content text,
	metadata json, -- Must contain 'session_id' and 'file_label'
	embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_debate_vector_store_embedding ON debate_vector_store USING HNSW (embedding vector_cosine_ops);
