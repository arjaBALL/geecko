'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const { detectProject } = require('../utils/project-detector');
const { generateModel } = require('../generators/ModelGenerator');
const { generateController } = require('../generators/ControllerGenerator');
const { generateService } = require('../generators/ServiceGenerator');
const { generateMigration } = require('../generators/MigrationGenerator');
const { generateCrud } = require('../generators/CrudGenerator');
const { printResult } = require('../utils/file-writer');

async function confirmOverwrite(message) {
  const { ok } = await inquirer.prompt([
    { type: 'confirm', name: 'ok', message, default: false },
  ]);
  return ok;
}

/**
 * `ci3 make` — a guided flow for people who don't want to remember every
 * flag. It asks what to generate, then only the follow-up questions that
 * artifact type actually needs, and finally delegates to the exact same
 * generators the direct commands use.
 */
function registerMakeInteractive(program) {
  program
    .command('make')
    .description('Interactively choose what to generate')
    .action(async () => {
      const project = detectProject();

      if (!project.found) {
        console.error(chalk.red('\n✖ This does not appear to be a CodeIgniter 3 project.\n'));
        console.error('  Make sure you run this command from the root directory of your CI3 application.\n');
        process.exitCode = 1;
        return;
      }

      const { type } = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'What do you want to generate?',
          choices: [
            { name: 'Model', value: 'model' },
            { name: 'Controller', value: 'controller' },
            { name: 'Service', value: 'service' },
            { name: 'Migration', value: 'migration' },
            { name: 'CRUD (controller + service + model + migration)', value: 'crud' },
          ],
        },
      ]);

      if (type === 'model') {
        const { name, table } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Model name (e.g. User):', validate: Boolean },
          { type: 'input', name: 'table', message: 'Table name (leave blank to guess):' },
        ]);
        printResult(await generateModel(project, name, { table: table || undefined, confirm: confirmOverwrite }));
        return;
      }

      if (type === 'controller') {
        const { name, model, useService, service } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Controller name (e.g. User):', validate: Boolean },
          { type: 'input', name: 'model', message: 'Model to load (leave blank to match controller name):' },
          { type: 'confirm', name: 'useService', message: 'Wire in a service?', default: true },
        ]);
        let serviceName;
        if (useService) {
          const answer = await inquirer.prompt([
            { type: 'input', name: 'service', message: 'Service class name (leave blank to guess):' },
          ]);
          serviceName = answer.service || undefined;
        }
        const result = await generateController(project, name, {
          model: model || undefined,
          service: useService ? serviceName || name : undefined,
          confirm: confirmOverwrite,
        });
        printResult(result);
        return;
      }

      if (type === 'service') {
        const { name, model } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Service name (e.g. UserService):', validate: Boolean },
          { type: 'input', name: 'model', message: 'Model it wraps (leave blank to guess):' },
        ]);
        printResult(await generateService(project, name, { model: model || undefined, confirm: confirmOverwrite }));
        return;
      }

      if (type === 'migration') {
        const { name, table } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Migration name (e.g. create_users_table):', validate: Boolean },
          { type: 'input', name: 'table', message: 'Table name (leave blank to infer):' },
        ]);
        printResult(await generateMigration(project, name, { table: table || undefined, confirm: confirmOverwrite }));
        return;
      }

      if (type === 'crud') {
        const { name, table } = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Entity name (e.g. User):', validate: Boolean },
          { type: 'input', name: 'table', message: 'Table name (leave blank to guess):' },
        ]);
        const { model, service, controller, migration } = await generateCrud(project, name, {
          table: table || undefined,
          confirm: confirmOverwrite,
        });
        printResult(model);
        printResult(service);
        printResult(controller);
        printResult(migration);
      }
    });
}

module.exports = { registerMakeInteractive };
