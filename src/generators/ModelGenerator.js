'use strict';

const path = require('path');
const naming = require('../utils/naming');
const { resolveOutputDir } = require('../utils/paths');
const { renderTemplate } = require('../utils/template-engine');
const { writeGeneratedFile } = require('../utils/file-writer');

/**
 * Generate a CI3 model file.
 *
 * @param {object} project - result of detectProject()
 * @param {string} name - raw name passed on the CLI, e.g. "User"
 * @param {object} options - { table, force, directory, confirm }
 */
async function generateModel(project, name, options = {}) {
  const modelClass = naming.modelClassName(name);
  const table = options.table || naming.tableNameFromName(name);

  const outputDir = resolveOutputDir(project.applicationDir, 'model', {
    directoryOption: options.directory,
  });
  const filePath = path.join(outputDir, `${modelClass}.php`);

  const content = renderTemplate('model.php.ejs', { modelClass, table });

  const result = await writeGeneratedFile(filePath, content, {
    force: options.force,
    confirm: options.confirm,
  });

  return { ...result, modelClass, table };
}

module.exports = { generateModel };
