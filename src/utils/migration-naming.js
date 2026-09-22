'use strict';

const fs = require('fs');
const path = require('path');
const naming = require('./naming');

/**
 * CodeIgniter 3's migration system supports two version styles, chosen by
 * $config['migration_type'] in application/config/migration.php:
 *
 *   'sequential' (default): files are prefixed 001_, 002_, 003_...
 *   'timestamp':             files are prefixed YYYYMMDDHHIISS_
 *
 * We read the project's own config (when present) instead of guessing, so
 * generated migrations actually match what CI3's migration runner expects.
 */
function detectMigrationType(applicationDir) {
  const configPath = path.join(applicationDir, 'config', 'migration.php');

  if (fs.existsSync(configPath)) {
    const source = fs.readFileSync(configPath, 'utf8');
    const match = source.match(/\$config\[['"]migration_type['"]\]\s*=\s*['"](\w+)['"]/);
    if (match) return match[1];
  }

  return 'sequential'; // CI3's own default
}

function pad(num, size) {
  return String(num).padStart(size, '0');
}

/** YYYYMMDDHHIISS, matching CI3's timestamp migration format exactly. */
function timestampVersion(date = new Date()) {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1, 2) +
    pad(date.getDate(), 2) +
    pad(date.getHours(), 2) +
    pad(date.getMinutes(), 2) +
    pad(date.getSeconds(), 2)
  );
}

/** Find the next sequential version by scanning existing migration files. */
function nextSequentialVersion(migrationsDir) {
  if (!fs.existsSync(migrationsDir)) return pad(1, 3);

  const existing = fs
    .readdirSync(migrationsDir)
    .map((f) => f.match(/^(\d+)_/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));

  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return pad(next, 3);
}

/**
 * Resolve the version prefix + class suffix + filename for a new migration.
 *
 * @param {string} applicationDir
 * @param {string} migrationsDir - already-resolved output directory
 * @param {string} rawName - e.g. "create_users_table"
 */
function resolveMigration(applicationDir, migrationsDir, rawName) {
  const type = detectMigrationType(applicationDir);
  const slug = naming.toSnake(rawName);

  const version =
    type === 'timestamp' ? timestampVersion() : nextSequentialVersion(migrationsDir);

  const fileName = `${version}_${slug}.php`;

  // CI3 migration class names are Migration_<Capitalized_Slug_With_Underscores>
  const classSuffix = slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('_');

  return { type, version, slug, fileName, classSuffix };
}

module.exports = { detectMigrationType, timestampVersion, nextSequentialVersion, resolveMigration };
