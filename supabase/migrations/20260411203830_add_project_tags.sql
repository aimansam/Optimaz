-- Add a tags column to projects (Postgres array of text)
ALTER TABLE projects ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
