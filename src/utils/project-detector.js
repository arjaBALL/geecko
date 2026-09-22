'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Walk upward from `startDir` looking for a directory that looks like the
 * root of a CodeIgniter 3 application. We search upward (not just cwd) so
 * the CLI still works when run from a subdirectory of the project.
 */
function findProjectRoot(startDir = process.cwd(), maxLevels = 6) {
  let dir = path.resolve(startDir);

  for (let i = 0; i <= maxLevels; i += 1) {
    if (looksLikeCi3Root(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }

  return null;
}

/**
 * A directory is treated as a CI3 root if it has the two hard requirements
 * (application/ and system/) plus at least one corroborating signal, so we
 * don't false-positive on an unrelated folder that merely happens to have
 * an "application" directory.
 */
function looksLikeCi3Root(dir) {
  const hasApplication = fs.existsSync(path.join(dir, 'application'));
  const hasSystem = fs.existsSync(path.join(dir, 'system'));

  if (!hasApplication || !hasSystem) return false;

  const corroborating = [
    path.join(dir, 'index.php'),
    path.join(dir, 'application', 'config', 'config.php'),
    path.join(dir, 'application', 'core'),
    path.join(dir, 'application', 'models'),
    path.join(dir, 'application', 'controllers'),
  ];

  return corroborating.some((p) => fs.existsSync(p));
}

/**
 * Detect the project, returning a descriptive result instead of throwing,
 * so callers (commands) can decide how to present the error.
 */
function detectProject(startDir = process.cwd()) {
  const root = findProjectRoot(startDir);

  if (!root) {
    return { found: false, root: null };
  }

  return {
    found: true,
    root,
    applicationDir: path.join(root, 'application'),
  };
}

module.exports = { detectProject, findProjectRoot, looksLikeCi3Root };
