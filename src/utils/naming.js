'use strict';

/**
 * Naming convention helpers shared by every generator.
 *
 * CodeIgniter 3 conventions this module encodes:
 *  - Controller class names: PascalCase, first letter uppercase (required by CI3).
 *  - Model class names: PascalCase + "_model" suffix (e.g. User_model).
 *  - Model file names match the class name exactly: User_model.php
 *  - Table names: snake_case, plural (a convention, not a CI3 requirement).
 *  - Service class names: PascalCase + "Service" suffix.
 */

/** Split an arbitrary identifier into lowercase words. */
function toWords(input) {
  return String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .replace(/[_\-\.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

/** PascalCase / StudlyCase */
function toStudly(input) {
  return toWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

/** camelCase */
function toCamel(input) {
  const studly = toStudly(input);
  return studly.charAt(0).toLowerCase() + studly.slice(1);
}

/** snake_case */
function toSnake(input) {
  return toWords(input).join('_');
}

/**
 * Very small English pluralizer covering the common cases we need for
 * table names. It is intentionally simple — real projects have irregular
 * nouns, so `--table=` is always available to override the guess.
 */
function pluralize(word) {
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es';
  if (/s$/i.test(word)) return word; // already looks plural
  return word + 's';
}

/** e.g. "user" | "User" | "user_profile" -> "User_model" */
function modelClassName(name) {
  return `${toStudly(name)}_model`;
}

/**
 * CI3 registers the loaded model as a property on the controller using the
 * exact identifier passed to $this->load->model(), so the property name is
 * the same as the class name (e.g. $this->User_model).
 */
function modelPropertyName(name) {
  return modelClassName(name);
}

/** e.g. "user" -> "User" (controllers must start with an uppercase letter in CI3) */
function controllerClassName(name) {
  return toStudly(name);
}

/**
 * CI3's $this->load->library('SomeClass') attaches the loaded library to
 * the controller as a property named after the lowercased file/class
 * name (unless a second argument gives an explicit alias) — e.g.
 * $this->load->library('UserService') becomes $this->userservice, NOT
 * $this->userService. This mirrors that exact behavior so generated
 * controllers reference the right property.
 */
function libraryPropertyName(className) {
  return String(className).toLowerCase();
}

/** e.g. "user" | "UserService" -> "UserService" */
function serviceClassName(name) {
  const studly = toStudly(name);
  return /Service$/.test(studly) ? studly : `${studly}Service`;
}

/** Derive a default table name from a model/controller-ish name. */
function tableNameFromName(name) {
  return pluralize(toSnake(name));
}

/** Lowercase, hyphen/underscore free identifier for view folders, routes, etc. */
function toKebab(input) {
  return toWords(input).join('-');
}

module.exports = {
  toWords,
  toStudly,
  toCamel,
  toSnake,
  toKebab,
  pluralize,
  modelClassName,
  modelPropertyName,
  controllerClassName,
  serviceClassName,
  libraryPropertyName,
  tableNameFromName,
};
