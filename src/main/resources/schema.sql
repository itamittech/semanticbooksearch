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
