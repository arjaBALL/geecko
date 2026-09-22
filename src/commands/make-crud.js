'use strict';

const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const { detectProject } = require('../utils/project-detector');
const { generateCrud } = require('../generators/CrudGenerator');
const { printResult } = require('../utils/file-writer');

async function confirmOverwrite(message) {
  const { ok } = await inquirer.prompt([
    { type: 'confirm', name: 'ok', message, default: false },
  ]);
  return ok;
}

function registerMakeCrud(program) {
  program
    .command('make:crud <name>')
    .description('Generate a Controller, Service, Model and migration together for one entity')
    .option('-t, --table <table>', 'Override the guessed table name')
    .option('-f, --force', 'Overwrite files if they already exist', false)
    .action(async (name, options) => {
      const project = detectProject();

      if (!project.found) {
        console.error(chalk.red('\n✖ This does not appear to be a CodeIgniter 3 project.\n'));
        console.error('  Make sure you run this command from the root directory of your CI3 application.\n');
        process.exitCode = 1;
        return;
      }

      const spinner = ora(`Generating CRUD set for "${name}"...`).start();
      spinner.stop(); // stop before interactive prompts may fire on overwrite

      console.log(chalk.bold(`\nGenerating CRUD set for "${name}"\n`));

      const { model, service, controller, migration } = await generateCrud(project, name, {
        table: options.table,
        force: options.force,
        confirm: confirmOverwrite,
      });

      printResult(model);
      printResult(service);
      printResult(controller);
      printResult(migration);

      console.log(chalk.bold.green('\n✔ CRUD set generated:'));
      console.log(`  Controller : ${controller.controllerClass}`);
      console.log(`  Service    : ${service.serviceClass}`);
      console.log(`  Model      : ${model.modelClass}  (table: ${model.table})`);
      console.log(`  Migration  : ${migration.fileName}`);
      console.log(chalk.dim('\nRun the migration with your CI3 migration runner to create the table.'));
    });
}

module.exports = { registerMakeCrud };
