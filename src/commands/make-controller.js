'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const { detectProject } = require('../utils/project-detector');
const { generateController } = require('../generators/ControllerGenerator');
const { printResult } = require('../utils/file-writer');

async function confirmOverwrite(message) {
  const { ok } = await inquirer.prompt([
    { type: 'confirm', name: 'ok', message, default: false },
  ]);
  return ok;
}

function registerMakeController(program) {
  program
    .command('make:controller <name>')
    .description('Generate a CI3 controller')
    .option('-m, --model <model>', 'Model to load (defaults to <name>)')
    .option('-s, --service <service>', 'Service to wire in via $this->service()')
    .option('-d, --directory <directory>', 'Subdirectory under application/controllers/')
    .option('-f, --force', 'Overwrite the file if it already exists', false)
    .action(async (name, options) => {
      const project = detectProject();

      if (!project.found) {
        console.error(chalk.red('\n✖ This does not appear to be a CodeIgniter 3 project.\n'));
        console.error('  Make sure you run this command from the root directory of your CI3 application.\n');
        process.exitCode = 1;
        return;
      }

      const result = await generateController(project, name, {
        model: options.model,
        service: options.service,
        directory: options.directory,
        force: options.force,
        confirm: confirmOverwrite,
      });

      printResult(result);
      console.log(chalk.dim(`\nClass: ${result.controllerClass}   Model: ${result.modelClass}${result.serviceClass ? `   Service: ${result.serviceClass}` : ''}`));
    });
}

module.exports = { registerMakeController };
