-- Replaces the emoji-character reaction values with plain-text identifiers,
-- and renames the column to match. The frontend now renders reactions as
-- icons (ThumbsUp, Heart, Flame, PartyPopper, Lightbulb) instead of native
-- emoji glyphs, so the stored values and column name follow suit.

ALTER TABLE blog_reactions CHANGE COLUMN emoji reaction VARCHAR(16) NOT NULL;

-- Convert any reactions recorded before this migration from the old emoji
-- values to the new identifiers. Safe to run even if the table is empty or
-- was already storing the new identifiers (the WHERE clauses simply match
-- nothing in that case).
UPDATE blog_reactions SET reaction = 'like'      WHERE reaction = '👍';
UPDATE blog_reactions SET reaction = 'love'      WHERE reaction = '❤️';
UPDATE blog_reactions SET reaction = 'fire'      WHERE reaction = '🔥';
UPDATE blog_reactions SET reaction = 'celebrate' WHERE reaction = '🎉';
UPDATE blog_reactions SET reaction = 'idea'      WHERE reaction = '💡';
