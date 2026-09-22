# ci3-generator

<img src="assets/mascot.svg" alt="ci3-generator mascot: a pixel-art gecko" width="180" />

A code generator / scaffolding CLI for **CodeIgniter 3** projects. Run one
command in your terminal instead of copy-pasting boilerplate for models,
controllers, services, and migrations.

```bash
ci3 make:model User
ci3 make:controller User --service=UserService
ci3 make:service UserService
ci3 make:migration create_users_table
ci3 make:crud User          # generates all four, wired together
ci3 make                    # interactive: pick what to generate
```

## Why a service layer, when CI3 doesn't have one

CodeIgniter 3 has no built-in concept called a "service" — but it does
have libraries, which are exactly the right shape for one: a plain class
loaded on demand and attached to the controller. So a generated service
is really just a library with a service-shaped template
(`application/libraries/<Name>.php`), loaded the normal, native CI3 way:

```php
$this->load->library('UserService');
$this->userservice->create($data);
```

Note the property is `$this->userservice`, all lowercase — that's CI3's
own convention (a loaded library is attached under the lowercased
class/file name unless you pass an alias), not something this tool
invents. Because this uses CI3's native loader, generated controllers
extend the ordinary `CI_Controller` — no custom base class required.

## Layered architecture this tool enforces

```
Controller  (HTTP concerns: input, routing, response)
    ↓
Service     (business logic, validation orchestration)
    ↓
Model       (database access)
    ↓
Database
```

This is intentionally not a heavyweight framework bolted onto CI3 — every
generated file is plain, readable CI3 code you can edit freely.

## Install

```bash
npm install -g ci3-generator
```

This gives you a global `ci3` command.

## Commands

| Command | What it does |
|---|---|
| `ci3 make:model <Name>` | `application/models/<Name>_model.php` |
| `ci3 make:controller <Name>` | `application/controllers/<Name>.php` |
| `ci3 make:service <Name>` | `application/libraries/<Name>.php` (a CI3 library) |
| `ci3 make:migration <name>` | `application/migrations/<version>_<name>.php` |
| `ci3 make:crud <Name>` | Runs all four together, wired to the same entity |
| `ci3 make` | Interactive prompt-driven version of the above |

### Shared options

| Flag | Applies to | Meaning |
|---|---|---|
| `--force`, `-f` | all | Overwrite an existing file without asking |
| `--directory`, `-d` | model/controller/service/migration | Subdirectory under the default folder, e.g. `--directory=admin` |
| `--table`, `-t` | model/migration/crud | Override the guessed table name |
| `--model`, `-m` | controller/service | Which model to wire up (defaults to the entity name) |
| `--service`, `-s` | controller | Which service/library to load via `$this->load->library()` |

### Examples

```bash
ci3 make:model User --table=users
ci3 make:model User --force
ci3 make:model User --directory=admin

ci3 make:controller User --service=UserService
ci3 make:crud User --table=users
```

## How project detection works

Before generating anything, the CLI walks upward from your current
directory looking for a folder containing both `application/` and
`system/`, plus at least one corroborating file (`index.php`,
`application/config/config.php`, etc.) so it doesn't false-positive on an
unrelated folder. If nothing is found, you get:

```
✖ This does not appear to be a CodeIgniter 3 project.

Make sure you run this command from the root directory of your CI3 application.
```

## Configuring output directories per project

By default, files go to CI3's own directories — `application/models`,
`application/controllers`, `application/libraries` (services included),
etc. To override any of these project-wide, add
`application/ci3-generator.json`:

```json
{
  "service": "application/modules/shared/libraries"
}
```

`--directory` on a single command always wins over this file.

## Migrations: sequential vs. timestamp

CI3 supports two migration version styles via
`$config['migration_type']` in `application/config/migration.php`:

- `sequential` (CI3's default): `001_`, `002_`, `003_`...
- `timestamp`: `YYYYMMDDHHIISS_`

This tool reads your project's own config and matches it automatically —
it does not assume timestamp-style versions.

`create_<table>_table` names are recognized and generate a real
`dbforge`-based `create_table()` / `drop_table()` pair; any other
migration name gets an empty `up()`/`down()` scaffold with `// TODO`
markers.

## Templates

All generated code comes from EJS templates in `src/templates/`, not
strings hardcoded in the CLI logic — so the output is easy to review and
adjust without touching the generator code paths.

## Testing locally with `npm link`

From inside the package directory:

```bash
npm install
npm link
```

`npm link` registers this package globally, pointed at your working copy,
so the `ci3` command runs your local code. Then, from a real CI3 project:

```bash
cd /path/to/your/ci3/project
ci3 make:model User
```

Any edits you make to the generator source take effect immediately — no
reinstall needed. When you're done testing:

```bash
npm unlink -g ci3-generator
```

## Publishing to npm

1. Update `version` in `package.json` (semver).
2. Make sure you're logged in: `npm login`.
3. From the package root: `npm publish`.

If this is the first publish and the name is taken, either choose a
different `name` in `package.json` or publish under a scope:

```json
{ "name": "@your-npm-username/ci3-generator" }
```

```bash
npm publish --access public
```

## Project structure

```
ci3-generator/
├── bin/
│   └── ci3.js                  # CLI entry point (commander setup)
├── src/
│   ├── commands/                # one file per CLI command
│   ├── generators/               # one file per artifact type — the actual file-writing logic
│   ├── templates/                # EJS templates, no hardcoded strings in JS
│   └── utils/
│       ├── project-detector.js   # finds the CI3 project root
│       ├── paths.js              # resolves output directories (+ per-project overrides)
│       ├── file-writer.js        # overwrite protection + result printing
│       ├── template-engine.js    # EJS rendering
│       ├── naming.js             # PascalCase/snake_case/pluralization helpers
│       └── migration-naming.js   # sequential vs. timestamp migration versioning
├── package.json
└── README.md
```

## A note on the naming/pluralization helper

`naming.js` includes a small heuristic English pluralizer (for guessing
table names from model names). It covers the common cases but isn't a
full inflection library — for irregular nouns, pass `--table` explicitly
rather than relying on the guess.
