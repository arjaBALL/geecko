'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Write `content` to `filePath`, refusing to clobber an existing file
 * unless `force` is true or the user explicitly confirms when prompted.
 *
 * Returns a result object rather than throwing on "skip", so batch
 * generators (like make:crud) can keep going and print a clean summary.
 */
async function writeGeneratedFile(filePath, content, { force = false, confirm } = {}) {
  const exists = fs.existsSync(filePath);

  if (exists && !force) {
    const shouldOverwrite = confirm
      ? await confirm(`${path.relative(process.cwd(), filePath)} already exists. Overwrite?`)
      : false;

    if (!shouldOverwrite) {
      return { status: 'skipped', filePath };
    }
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');

  return { status: exists ? 'overwritten' : 'created', filePath };
}

function printResult(result) {
  const rel = path.relative(process.cwd(), result.filePath);

  switch (result.status) {
    case 'created':
      console.log(chalk.green('✔ created  '), rel);
      break;
    case 'overwritten':
      console.log(chalk.yellow('✔ replaced '), rel);
      break;
    case 'skipped':
      console.log(chalk.gray('… skipped  '), rel, chalk.gray('(already exists, use --force to replace)'));
      break;
    default:
      console.log(rel);
  }
}

module.exports = { writeGeneratedFile, printResult };
