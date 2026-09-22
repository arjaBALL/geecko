'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Default sub-directories, relative to application/, for each artifact
 * type. These all match CI3's own built-in conventions. "service" is
 * deliberately mapped to CI3's native libraries/ directory rather than a
 * custom folder — CI3 already has a first-class concept (a "library")
 * for exactly this kind of reusable class, loaded via
 * $this->load->library(), so a generated "service" is really just a
 * library with a service-shaped template.
 */
const DEFAULT_SUBDIRS = {
  model: 'models',
  controller: 'controllers',
  service: 'libraries',
  library: 'libraries',
  helper: 'helpers',
  migration: 'migrations',
  core: 'core',
  view: 'views',
};

/**
 * Optional project-level config file: application/ci3-generator.json
 * lets a team override default directories once instead of passing
 * --directory on every command, e.g.:
 *   { "services": "application/modules/shared/services" }
 */
function loadProjectConfig(applicationDir) {
  const configPath = path.join(applicationDir, 'ci3-generator.json');
  if (!fs.existsSync(configPath)) return {};

  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    throw new Error(
      `Could not parse ${configPath}: ${err.message}`
    );
  }
}

/**
 * Resolve the absolute output directory for a given artifact type.
 *
 * Resolution order (highest priority first):
 *   1. --directory CLI flag (relative to application/<defaultSubdir>/)
 *   2. application/ci3-generator.json override
 *   3. built-in default (application/<type-subdir>/)
 */
function resolveOutputDir(applicationDir, type, { directoryOption } = {}) {
  const config = loadProjectConfig(applicationDir);
  const defaultSubdir = DEFAULT_SUBDIRS[type];

  if (!defaultSubdir) {
    throw new Error(`Unknown artifact type: ${type}`);
  }

  const base = path.join(applicationDir, defaultSubdir);

  if (directoryOption) {
    // --directory=admin under make:model User -> application/models/admin/
    return path.join(base, directoryOption);
  }

  if (config[type]) {
    return path.isAbsolute(config[type])
      ? config[type]
      : path.join(path.dirname(applicationDir), config[type]);
  }

  return base;
}

module.exports = { DEFAULT_SUBDIRS, loadProjectConfig, resolveOutputDir };
