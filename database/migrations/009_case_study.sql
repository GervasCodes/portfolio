-- Case-study layout for featured projects — lets the admin project editor
-- capture a structured Problem -> Approach -> Architecture -> Results
-- write-up alongside the existing free-form `description`. Purely additive
-- and nullable, so existing projects (and the plain-description layout)
-- keep working unchanged; `case_study_enabled` decides which layout the
-- project detail page renders.

ALTER TABLE projects
  ADD COLUMN case_study_enabled BOOLEAN DEFAULT FALSE AFTER description,
  ADD COLUMN case_study_problem TEXT NULL AFTER case_study_enabled,
  ADD COLUMN case_study_approach TEXT NULL AFTER case_study_problem,
  ADD COLUMN case_study_architecture TEXT NULL AFTER case_study_approach,
  ADD COLUMN case_study_results TEXT NULL AFTER case_study_architecture;
