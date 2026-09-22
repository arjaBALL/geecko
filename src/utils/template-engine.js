'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * Render a template from src/templates/<name> with the given data.
 * Keeping this as a single choke point means every generator loads
 * templates the same way, and it's the one place we'd add support for
 * user-overridden templates (e.g. a project-local templates/ folder)
 * later without touching the generators themselves.
 */
function renderTemplate(templateName, data, { customTemplatesDir } = {}) {
  const candidatePaths = [];

  if (customTemplatesDir) {
    candidatePaths.push(path.join(customTemplatesDir, templateName));
  }
  candidatePaths.push(path.join(TEMPLATES_DIR, templateName));

  const templatePath = candidatePaths.find((p) => fs.existsSync(p));

  if (!templatePath) {
    throw new Error(`Template not found: ${templateName} (looked in ${candidatePaths.join(', ')})`);
  }

  return ejs.render(fs.readFileSync(templatePath, 'utf8'), data, {
    filename: templatePath, // enables <%- include(...) %> if templates ever need it
  });
}

module.exports = { renderTemplate, TEMPLATES_DIR };
