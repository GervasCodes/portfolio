-- Fix: Expand projects.summary from VARCHAR(300) to TEXT
-- Previously inserting summaries longer than 300 characters caused ER_DATA_TOO_LONG (errno 1406)
ALTER TABLE projects MODIFY COLUMN summary TEXT;
