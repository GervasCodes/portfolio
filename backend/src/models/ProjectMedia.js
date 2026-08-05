const BaseModel = require('./BaseModel');
const db = require('../config/database');

class ProjectMediaModel extends BaseModel {
  constructor() {
    super('project_media', ['project_id', 'media_type', 'url', 'thumbnail_url', 'caption', 'sort_order']);
  }

  async findByProject(projectId) {
    return db.query(
      `SELECT * FROM project_media WHERE project_id = ? ORDER BY sort_order ASC, id ASC`,
      [projectId]
    );
  }

  async nextSortOrder(projectId) {
    const rows = await db.query(
      `SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM project_media WHERE project_id = ?`,
      [projectId]
    );
    return (rows[0]?.maxOrder ?? -1) + 1;
  }

  /**
   * Persists a new relative order for a project's media in one go.
   * `orderedIds` is the full list of media ids for this project, in the
   * order they should appear — index becomes the new sort_order.
   */
  async reorder(projectId, orderedIds) {
    const existing = await this.findByProject(projectId);
    const validIds = new Set(existing.map((row) => row.id));
    const idsToApply = orderedIds.filter((id) => validIds.has(Number(id)));

    await Promise.all(
      idsToApply.map((id, index) =>
        db.query(`UPDATE project_media SET sort_order = ? WHERE id = ? AND project_id = ?`, [
          index,
          id,
          projectId,
        ])
      )
    );

    return this.findByProject(projectId);
  }
}

module.exports = new ProjectMediaModel();
