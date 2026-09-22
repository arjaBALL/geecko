'use strict';

const naming = require('../utils/naming');
const { generateModel } = require('./ModelGenerator');
const { generateService } = require('./ServiceGenerator');
const { generateController } = require('./ControllerGenerator');
const { generateMigration } = require('./MigrationGenerator');

/**
 * Generate a full Controller -> Service -> Model (+ migration) set for one
 * entity, wired together consistently. This is deliberately a thin
 * composition of the four single-purpose generators rather than its own
 * code path, so make:crud can never drift out of sync with what
 * make:model / make:controller / etc. produce individually.
 *
 * @param {object} options - { table, force, directory, confirm }
 */
async function generateCrud(project, name, options = {}) {
  const table = options.table || naming.tableNameFromName(name);
  const serviceName = naming.serviceClassName(name);

  const model = await generateModel(project, name, {
    table,
    force: options.force,
    confirm: options.confirm,
  });

  const service = await generateService(project, serviceName, {
    model: name,
    force: options.force,
    confirm: options.confirm,
  });

  const controller = await generateController(project, name, {
    model: name,
    service: serviceName,
    force: options.force,
    confirm: options.confirm,
  });

  const migration = await generateMigration(project, `create_${table}_table`, {
    table,
    force: options.force,
    confirm: options.confirm,
  });

  return { model, service, controller, migration };
}

module.exports = { generateCrud };
