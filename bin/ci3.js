#!/usr/bin/env node

'use strict';

const { Command } = require('commander');
const packageJson = require('../package.json');

const { registerMakeModel } = require('../src/commands/make-model');
const { registerMakeController } = require('../src/commands/make-controller');
const { registerMakeService } = require('../src/commands/make-service');
const { registerMakeMigration } = require('../src/commands/make-migration');
const { registerMakeCrud } = require('../src/commands/make-crud');
const { registerMakeInteractive } = require('../src/commands/make-interactive');

const program = new Command();

program
  .name('ci3')
  .description('Code generator / scaffolding CLI for CodeIgniter 3 projects')
  .version(packageJson.version);

registerMakeModel(program);
registerMakeController(program);
registerMakeService(program);
registerMakeMigration(program);
registerMakeCrud(program);
registerMakeInteractive(program);

program.parseAsync(process.argv);
