const db = require('../config/database');
const { AppError } = require('../utills/responce');

// Fixed emoji set — deliberately small and pre-defined so the frontend can
// render stable buttons and the backend can validate without a lookup table.
const ALLOWED_REACTIONS = ['👍', '❤️', '🔥', '🎉', '💡'];

// A view only counts once per (post, visitor) inside this window, so
// reloading/re-reading a post repeatedly doesn't inflate the counter.
// Same dedupe intent as `analytics_visits` (IP-aware), keyed primarily on
// a lightweight anonymous session cookie so visitors sharing an IP (office/
// campus networks) still count separately.
const VIEW_DEDUPE_WINDOW_HOURS = 24;

/**
 * BlogEngagementService — view-dedupe + reactions for blog posts.
 * Talks to the DB directly (no BaseModel) for the same reason
 * AnalyticsService does: these are narrow, single-purpose write paths,
 * not general-purpose CRUD resources.
 */
class BlogEngagementService {
  /**
   * Records a view for `blogId` from `viewerKey`/`ip`, incrementing
   * `blogs.views` only if this visitor hasn't been counted for this post
   * within the dedupe window. Returns true if the view was counted.
   */
  async recordView({ blogId, viewerKey, ip }) {
    if (!viewerKey) return false; // no cookie support — skip rather than risk double-counting

    const existing = await db.query(
      `SELECT last_viewed_at FROM blog_post_views WHERE blog_id = ? AND viewer_key = ? LIMIT 1`,
      [blogId, viewerKey]
    );

    if (!existing[0]) {
      try {
        await db.query(
          `INSERT INTO blog_post_views (blog_id, viewer_key, ip_address, last_viewed_at, view_count)
           VALUES (?, ?, ?, NOW(), 1)`,
          [blogId, viewerKey, ip || null]
        );
      } catch (err) {
        // Lost a race with a concurrent request from the same visitor —
        // that request already counted this view, so just skip.
        if (err.code !== 'ER_DUP_ENTRY') throw err;
        return false;
      }
    } else {
      const hoursSince = (Date.now() - new Date(existing[0].last_viewed_at).getTime()) / 3_600_000;
      if (hoursSince < VIEW_DEDUPE_WINDOW_HOURS) return false;

      await db.query(
        `UPDATE blog_post_views SET ip_address = ?, last_viewed_at = NOW(), view_count = view_count + 1
         WHERE blog_id = ? AND viewer_key = ?`,
        [ip || null, blogId, viewerKey]
      );
    }

    await db.query(`UPDATE blogs SET views = views + 1 WHERE id = ?`, [blogId]);
    return true;
  }

  /** Reaction counts for a post, plus which one (if any) `viewerKey` picked. */
  async getReactions(blogId, viewerKey) {
    const rows = await db.query(
      `SELECT emoji, COUNT(*) AS count FROM blog_reactions WHERE blog_id = ? GROUP BY emoji`,
      [blogId]
    );
    const counts = ALLOWED_REACTIONS.reduce((acc, emoji) => ({ ...acc, [emoji]: 0 }), {});
    rows.forEach((r) => { counts[r.emoji] = Number(r.count); });

    let mine = null;
    if (viewerKey) {
      const mineRows = await db.query(
        `SELECT emoji FROM blog_reactions WHERE blog_id = ? AND viewer_key = ? LIMIT 1`,
        [blogId, viewerKey]
      );
      mine = mineRows[0]?.emoji ?? null;
    }

    return { counts, total: Object.values(counts).reduce((a, b) => a + b, 0), mine };
  }

  /** Sets (or swaps) `viewerKey`'s reaction on a post to `emoji`. */
  async setReaction(blogId, viewerKey, emoji) {
    if (!ALLOWED_REACTIONS.includes(emoji)) {
      throw AppError.badRequest(`emoji must be one of: ${ALLOWED_REACTIONS.join(' ')}`);
    }
    await db.query(
      `INSERT INTO blog_reactions (blog_id, viewer_key, emoji) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE emoji = VALUES(emoji), created_at = CURRENT_TIMESTAMP`,
      [blogId, viewerKey, emoji]
    );
    return this.getReactions(blogId, viewerKey);
  }

  /** Removes `viewerKey`'s reaction from a post, if any. */
  async removeReaction(blogId, viewerKey) {
    await db.query(`DELETE FROM blog_reactions WHERE blog_id = ? AND viewer_key = ?`, [blogId, viewerKey]);
    return this.getReactions(blogId, viewerKey);
  }
}

module.exports = { blogEngagementService: new BlogEngagementService(), ALLOWED_REACTIONS };
