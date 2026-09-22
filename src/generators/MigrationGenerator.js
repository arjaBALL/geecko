'use strict';

const path = require('path');
const { resolveOutputDir } = require('../utils/paths');
const { renderTemplate } = require('../utils/template-engine');
const { writeGeneratedFile } = require('../utils/file-writer');
const { resolveMigration } = require('../utils/migration-naming');

/**
 * @param {object} options - { table, force, directory, confirm }
 */
async function generateMigration(project, rawName, options = {}) {
  const outputDir = resolveOutputDir(project.applicationDir, 'migration', {
    directoryOption: options.directory,
  });

  const { fileName, classSuffix, version, type, slug } = resolveMigration(
    project.applicationDir,
    outputDir,
    rawName
  );

  const createMatch = slug.match(/^create_(.+)_table$/);
  const isCreateTable = Boolean(createMatch);
  const table = options.table || (createMatch ? createMatch[1] : null);

  const filePath = path.join(outputDir, fileName);

  const content = renderTemplate('migration.php.ejs', {
    classSuffix,
    isCreateTable,
    table,
  });

  const result = await writeGeneratedFile(filePath, content, {
    force: options.force,
    confirm: options.confirm,
  });

  return { ...result, fileName, classSuffix, version, migrationType: type };
}

module.exports = { generateMigration };
