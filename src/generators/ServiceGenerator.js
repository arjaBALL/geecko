'use strict';

const path = require('path');
const naming = require('../utils/naming');
const { resolveOutputDir } = require('../utils/paths');
const { renderTemplate } = require('../utils/template-engine');
const { writeGeneratedFile } = require('../utils/file-writer');

/**
 * @param {object} options - { model, force, directory, confirm }
 *   model: the entity the service is about, used to pick which model it
 *   wires up to. Defaults to the service name with any "Service" suffix
 *   stripped, e.g. "UserService" -> subject "User".
 */
async function generateService(project, name, options = {}) {
  const serviceClass = naming.serviceClassName(name);
  const subject = options.model || name.replace(/Service$/i, '') || name;
  const modelClass = naming.modelClassName(subject);
  const modelProperty = naming.modelPropertyName(subject);

  const outputDir = resolveOutputDir(project.applicationDir, 'service', {
    directoryOption: options.directory,
  });
  const filePath = path.join(outputDir, `${serviceClass}.php`);

  const content = renderTemplate('service.php.ejs', {
    serviceClass,
    modelClass,
    modelProperty,
    subject,
  });

  const result = await writeGeneratedFile(filePath, content, {
    force: options.force,
    confirm: options.confirm,
  });

  return { ...result, serviceClass, modelClass };
}

module.exports = { generateService };
