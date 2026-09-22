'use strict';

const path = require('path');
const naming = require('../utils/naming');
const { resolveOutputDir } = require('../utils/paths');
const { renderTemplate } = require('../utils/template-engine');
const { writeGeneratedFile } = require('../utils/file-writer');

/**
 * @param {object} options - { model, service, table, force, directory, confirm }
 *   model:   name to load as the model (defaults to the controller name)
 *   service: name of a service/library to wire in via CI3's native
 *            $this->load->library(), optional — omit for a plain
 *            CRUD-less controller.
 */
async function generateController(project, name, options = {}) {
  const controllerClass = naming.controllerClassName(name);
  const modelClass = naming.modelClassName(options.model || name);
  const modelProperty = naming.modelPropertyName(options.model || name);
  const viewFolder = naming.toKebab(name);
  const routeSlug = naming.toKebab(name);
  const itemsVar = naming.toCamel(name) + 's';
  const itemVar = naming.toCamel(name);

  const withService = Boolean(options.service);
  const serviceClass = withService ? naming.serviceClassName(options.service) : null;
  // CI3's $this->load->library('SomeClass') attaches it to the controller
  // as a lowercased property — NOT camelCase — so we must match that here.
  const servicePropertyName = withService ? naming.libraryPropertyName(serviceClass) : null;

  const outputDir = resolveOutputDir(project.applicationDir, 'controller', {
    directoryOption: options.directory,
  });
  const filePath = path.join(outputDir, `${controllerClass}.php`);

  const content = renderTemplate('controller.php.ejs', {
    controllerClass,
    modelClass,
    modelProperty,
    withService,
    serviceClass,
    servicePropertyName,
    viewFolder,
    routeSlug,
    itemsVar,
    itemVar,
  });

  const result = await writeGeneratedFile(filePath, content, {
    force: options.force,
    confirm: options.confirm,
  });

  return { ...result, controllerClass, modelClass, serviceClass };
}

module.exports = { generateController };
