---
name: xx
description: Work with xx (https://github.com/stopsopa/xx) - a menu of project shell commands defined in xx.ts / xx.js / xx.mjs / xx.cjs. Use when a project has an xx.* file (also in .git/), when the user says "xx <something>" or "run it through xx", or asks to add, change, explain or run a command from the xx menu.
---

# xx

`xx` is a per-project menu of named shell commands. The config is a JS/TS file exporting a function which returns `{ "command name": { command: "<bash script>", ... } }`. A human types `xx` (interactive menu) or `xx <name> [args]`; the script of that command is written to a file and executed with `/bin/bash`.

The xx menu is usually the best list of "how things are done in this project" (build, test, deploy...). Read it before inventing your own commands.

## Which file is used

First found wins, only in the current directory (no walking up):

1. `.git/xx.ts`, `.git/xx.js`, `.git/xx.mjs`, `.git/xx.cjs` (private, not committed)
2. `./xx.ts`, `./xx.js`, `./xx.mjs`, `./xx.cjs` (shared with the team)
3. `~/xx.*` (only when nothing above exists)

A file in `.git/` hides the one in `./` completely, they are not merged. If the menu is not what you expect, check `.git/` first.

## You are not in an interactive shell

`xx` is an alias (`source .../xx.sh`), so it does not exist in your shell, and the menu needs a terminal. Call the binary directly, its path is in `XX_BIN` (`~/` at the beginning means home):

```sh
XX="${XX_BIN/#\~/$HOME}"
```

If `XX_BIN` is not defined, xx is not installed for you: read the config file itself (see "Format") and tell the user.

## Find out what commands exist and what they do

```sh
"$XX" --list            # number, name, description
"$XX" --list --json     # the same + confirm, source, order
"$XX" --gen "<name>"    # prints the exact bash script of the command, executes nothing
```

`--gen` is the way to learn what a command really does: the config is code (env vars, template literals, shared snippets), so the source file may differ from the final script. `--gen` shows the script after all of that was evaluated, with the current environment. Always read it before running a command you don't know.

## Run a command

```sh
FILE="$(XX_CONFIRM=false "$XX" "<name>" arg1 arg2 < /dev/null)"; CODE="$?"
# CODE 0: run it.  CODE 55: the command has "source: true".  Anything else: error, already printed
[ "$CODE" = "0" ] && /bin/bash "$FILE" arg1 arg2
```

- Arguments are passed twice on purpose: to the binary (the config sees them as `ctx.args`) and to the script (`${1}`, `${2}`).
- `XX_CONFIRM=false` skips the "Run command?" question, which would fail without a terminal.
- stdin of the script is yours to use: `echo data | /bin/bash "$FILE"`.
- `source: true` commands (exit code 55) are meant to change the user's interactive shell (`cd`, `source venv/bin/activate`, `export`). Sourcing them in your shell has no effect for the user: tell the user to run `xx <name>` instead.
- Env vars for the config are set on the binary: `ENVFILE=.env.ci "$XX" --gen "docker up"`.

Commands can be destructive or outward-facing (deploy, publish, delete). `confirm` not being `false` is the author's hint that it needs care: read the script and ask the user before running such a command.

## Format

```ts
// xx.ts - "export default". In xx.cjs: "module.exports = (setup, ctx) => { ... }"
export default (setup, ctx) => {          // may be async. ctx = { args, cwd, configPath }
  return {
    "docker up": {
      command: `
set -e
docker compose --env-file "${process.env.ENVFILE || ".env"}" up -d
echo "first argument: \${1}"
`,
      description: `start all containers`, // optional, shown under the menu
      confirm: false,                      // optional, default true: ask before running
      source: false,                       // optional, default false. true: run in the user's current shell
      order: 10,                           // optional, lower goes first, missing = 0
    },
    ...setup,
  };
};
```

The trap when writing commands: `command` is a JS template literal which becomes a bash script.

- `${x}` is evaluated by node when the config is loaded.
- `\${x}` and `\$(...)` are left for bash. Every bash variable and command substitution has to be escaped like that.
- A backslash meant for bash has to be doubled (`\\n`, `\\.`).

## Structure of a good config

- Names: short, as a human would type them, spaces are fine (`docker up`, `db migrate`). Related commands share a prefix so they sit together and filter well.
- One command = one task. Start multi-line scripts with `set -e`.
- `description` says what it does in one line; mention arguments it takes.
- `confirm: false` only for harmless commands (status, help, build). Leave the default for anything destructive.
- `source: true` only when the command has to change the user's shell.
- Shared pieces of script go to constants at the top of the file and are interpolated with `${...}`.
- Keep the existing style and module format of the file (`.cjs` is CommonJS, `.mjs` ES module, `.ts`/`.js` follow the project).

## Installing a config in a project ("add xx to this project")

Never write the file from scratch, bring the template:

```sh
"$XX" --init            # .git/xx.ts if .git exists (private, not committed), else ./xx.ts
"$XX" --esm ./xx.ts     # ./xx.ts - committed, shared with the team
"$XX" --init cjs        # the same template as xx.cjs, when node is older than 22.18
```

It refuses to overwrite an existing file.

Before creating it ask the user where the config should live, unless they already said:

- **in the repository** (`./xx.ts`): committed, the whole team gets the same menu.
- **only for them** (`.git/xx.ts`): never committed, invisible to others. This is where `--init` puts it by default.

Changing the mind later is just moving the file one directory up or down (`mv .git/xx.ts xx.ts`), nothing else refers to its location. Only one of them may exist: the one in `.git/` hides the one in `./`.

The template is a showcase of examples, not a config to keep. After downloading it:

1. Remove every command except `help`. Keep the top of the file (comments, color constants, the `enter` / `esc` snippets, types): commands you add may use them.
2. Rewrite `help`: it is the "what is this project" card. Keep the line which prints the link to the repository, delete the example content (admin urls, dev notes) and put there what is true for this project: link to the repository (usually GitHub; the line in the template derives it from `git ls-remote --get-url origin`, check that it prints a working link for this remote), docs, local urls, anything worth having at hand.
3. Add the commands the user asked for (see "Structure of a good config").
4. Verify as described below.

## After editing the config

```sh
"$XX" --list            # the config still loads, the command is there
"$XX" --gen "<name>"    # the script is exactly what you intended (escaping!)
```

Errors of the config (syntax, wrong shape) are printed by `--list` with the path of the file.

## Other

- `"$XX" --env` shows all `XX_*` env vars with final values, `"$XX" --help` everything else.
- Setup problems (`XX_NODE_BINARY`, md5 mismatch between `xx.sh` and the binary) and `xx --update` are for the user to handle in their own terminal.
