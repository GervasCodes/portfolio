-- Project media gallery — lets each project have many images AND videos,
-- manually orderable, instead of the single `cover_image_url` / JSON
-- `gallery` column on `projects`. The old columns are left untouched for
-- backward compatibility (cover image is still `projects.cover_image_url`);
-- this table is purely additive.

CREATE TABLE IF NOT EXISTS project_media (
  id             INT          AUTO_INCREMENT PRIMARY KEY,
  project_id     INT          NOT NULL,
  media_type     ENUM('image', 'video') NOT NULL DEFAULT 'image',
  url            VARCHAR(500) NOT NULL,
  thumbnail_url  VARCHAR(500) NULL COMMENT 'Optional poster frame, used for videos',
  caption        VARCHAR(255) NULL,
  sort_order     INT          NOT NULL DEFAULT 0,
  created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_media_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_media_project (project_id),
  INDEX idx_project_media_project_sort (project_id, sort_order)
);
