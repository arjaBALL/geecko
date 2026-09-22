'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const { detectProject } = require('../utils/project-detector');
const { generateModel } = require('../generators/ModelGenerator');
const { printResult } = require('../utils/file-writer');

async function confirmOverwrite(message) {
  const { ok } = await inquirer.prompt([
    { type: 'confirm', name: 'ok', message, default: false },
  ]);
  return ok;
}

function registerMakeModel(program) {
  program
    .command('make:model <name>')
    .description('Generate a CI3 model (e.g. User -> User_model.php)')
    .option('-t, --table <table>', 'Override the guessed table name')
    .option('-d, --directory <directory>', 'Subdirectory under application/models/')
    .option('-f, --force', 'Overwrite the file if it already exists', false)
    .action(async (name, options) => {
      const project = detectProject();

      if (!project.found) {
        console.error(chalk.red('\n✖ This does not appear to be a CodeIgniter 3 project.\n'));
        console.error('  Make sure you run this command from the root directory of your CI3 application.\n');
        process.exitCode = 1;
        return;
      }

      const result = await generateModel(project, name, {
        table: options.table,
        directory: options.directory,
        force: options.force,
        confirm: confirmOverwrite,
      });

      printResult(result);

      if (result.status !== 'skipped') {
        console.log(chalk.dim(`\nClass: ${result.modelClass}   Table: ${result.table}`));
      }
    });
}

module.exports = { registerMakeModel };
