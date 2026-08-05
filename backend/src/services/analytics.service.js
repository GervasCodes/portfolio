const db = require('../config/database');

/**
 * Minimal, dependency-free analytics: records page visits into the
 * `analytics_visits` table so the admin dashboard can chart traffic
 * without needing a third-party analytics account.
 */
class AnalyticsService {
  async recordVisit({ path, referrer, userAgent, ip }) {
    await db.query(
      `INSERT INTO analytics_visits (path, referrer, user_agent, ip_address) VALUES (?, ?, ?, ?)`,
      [path, referrer || null, userAgent || null, ip || null]
    );
  }

  async getSummary({ days = 30 } = {}) {
    const totals = await db.query(
      `SELECT COUNT(*) AS total_visits, COUNT(DISTINCT ip_address) AS unique_visitors
       FROM analytics_visits WHERE visited_at >= (NOW() - INTERVAL ? DAY)`,
      [days]
    );

    const topPages = await db.query(
      `SELECT path, COUNT(*) AS visits FROM analytics_visits
       WHERE visited_at >= (NOW() - INTERVAL ? DAY)
       GROUP BY path ORDER BY visits DESC LIMIT 10`,
      [days]
    );

    const dailyTrend = await db.query(
      `SELECT DATE(visited_at) AS date, COUNT(*) AS visits FROM analytics_visits
       WHERE visited_at >= (NOW() - INTERVAL ? DAY)
       GROUP BY DATE(visited_at) ORDER BY date ASC`,
      [days]
    );

    return {
      totalVisits: totals[0]?.total_visits ?? 0,
      uniqueVisitors: totals[0]?.unique_visitors ?? 0,
      topPages,
      dailyTrend,
    };
  }
}

module.exports = new AnalyticsService();
