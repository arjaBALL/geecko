'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const { detectProject } = require('../utils/project-detector');
const { generateService } = require('../generators/ServiceGenerator');
const { printResult } = require('../utils/file-writer');

async function confirmOverwrite(message) {
  const { ok } = await inquirer.prompt([
    { type: 'confirm', name: 'ok', message, default: false },
  ]);
  return ok;
}

function registerMakeService(program) {
  program
    .command('make:service <name>')
    .description('Generate a CI3 service (business logic layer, as a native CI3 library)')
    .option('-m, --model <model>', 'Model the service wires up to (defaults to <name> minus "Service")')
    .option('-d, --directory <directory>', 'Subdirectory under application/libraries/')
    .option('-f, --force', 'Overwrite the file if it already exists', false)
    .action(async (name, options) => {
      const project = detectProject();

      if (!project.found) {
        console.error(chalk.red('\n✖ This does not appear to be a CodeIgniter 3 project.\n'));
        console.error('  Make sure you run this command from the root directory of your CI3 application.\n');
        process.exitCode = 1;
        return;
      }

      const result = await generateService(project, name, {
        model: options.model,
        directory: options.directory,
        force: options.force,
        confirm: confirmOverwrite,
      });

      printResult(result);
      console.log(chalk.dim(`\nClass: ${result.serviceClass}   Wired model: ${result.modelClass}`));
    });
}

module.exports = { registerMakeService };
