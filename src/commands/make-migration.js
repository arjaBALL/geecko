'use strict';

const chalk = require('chalk');
const inquirer = require('inquirer');
const { detectProject } = require('../utils/project-detector');
const { generateMigration } = require('../generators/MigrationGenerator');
const { printResult } = require('../utils/file-writer');

async function confirmOverwrite(message) {
  const { ok } = await inquirer.prompt([
    { type: 'confirm', name: 'ok', message, default: false },
  ]);
  return ok;
}

function registerMakeMigration(program) {
  program
    .command('make:migration <name>')
    .description('Generate a CI3 migration (e.g. create_users_table)')
    .option('-t, --table <table>', 'Table name (inferred from create_<table>_table names)')
    .option('-d, --directory <directory>', 'Subdirectory under application/migrations/')
    .option('-f, --force', 'Overwrite the file if it already exists', false)
    .action(async (name, options) => {
      const project = detectProject();

      if (!project.found) {
        console.error(chalk.red('\n✖ This does not appear to be a CodeIgniter 3 project.\n'));
        console.error('  Make sure you run this command from the root directory of your CI3 application.\n');
        process.exitCode = 1;
        return;
      }

      const result = await generateMigration(project, name, {
        table: options.table,
        directory: options.directory,
        force: options.force,
        confirm: confirmOverwrite,
      });

      printResult(result);
      console.log(
        chalk.dim(
          `\nVersion: ${result.version} (${result.migrationType})   Class: Migration_${result.classSuffix}`
        )
      );
    });
}

module.exports = { registerMakeMigration };
