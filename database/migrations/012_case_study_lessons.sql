-- Completes the case-study structure with the 5th section: Lessons
-- Learned. The original migration (009_case_study.sql) covered
-- Problem/Approach/Architecture/Results; this was the one section still
-- missing. Purely additive and nullable, same as the rest of the
-- case-study columns.

ALTER TABLE projects
  ADD COLUMN case_study_lessons TEXT NULL AFTER case_study_results;
