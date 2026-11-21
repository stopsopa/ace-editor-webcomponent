// github edit  : https://github.com/stopsopa/xx/edit/main/templates/xx.ts

// in order to run any xx command with custom export env var:
// (shopt -s expand_aliases; export ENVFILE=.env.ci; xx "docker up")

// 🚀 -
// ✅ -
// ⚙️  -
// 🗑️  -
// 🛑 -
// to call other xx commands from inside any xx command use:
//    shopt -s expand_aliases && source ~/.bashrc
// after that just do:
//   xx <command_name>
const S = "\\";
const GRAY = "\x1b[38;5;244m",
  BLACK = "\x1b[30m",
  RED = "\x1b[31m",
  GREEN = "\x1b[32m",
  YELLOW = "\x1b[33m",
  BLUE = "\x1b[34m",
  MAGENTA = "\x1b[35m",
  CYAN = "\x1b[36m",
  WHITE = "\x1b[37m",
  BOLD = "\x1b[1m",
  REVERSE = "\x1b[7m",
  RESET = "\x1b[0m";

const enter = `printf '\n${GREEN}Press Enter to continue (any other key exits)...${RESET}\n';old=$(stty -g);stty -icanon -echo
IFS= read -r -n1 k 2>/dev/null||IFS= read -r k;stty "$old"
[ -n "$k" ]&&exit 0;`;

const esc = `printf '\n${GREEN}Press any key to continue (Esc to exit)...${RESET}\n';old=$(stty -g);stty -icanon -echo
IFS= read -r -n1 k 2>/dev/null||IFS= read -r k;stty "$old"
[ "$k" = "$(printf '\\033')" ]&&exit 0;`;

type Command = {
  // shell script, written to xx_generated.sh and executed with /bin/bash
  command: string;
  // shown under the menu for selected row. Default: name of the command
  description?: string;
  // default true: ask "Run command?" before running
  confirm?: boolean;
  // default false. true = run in the current shell (source) instead of /bin/bash
  source?: boolean;
  // lower goes first. Missing means 0, so negative = top, positive = bottom
  order?: number;
};

type Commands = Record<string, Command>;

type Ctx = {
  // arguments given after the name of the command: xx <name> [args]
  args: string[];
  // directory xx was called in
  cwd: string;
  // path of this file
  configPath: string;
};

export default (setup: Commands, ctx: Ctx): Commands => {
  return {
    help: {
      command: `
set -e
export NODE_OPTIONS=""

cat <<EEE

  🐙 GitHub: $(git ls-remote --get-url origin | awk '{\$1=\$1};1' | tr -d '\\n' | sed -E 's/git@github\\.com:([^/]+)\\/(.+)\\.git/https:\\/\\/github.com\\/\\1\\/\\2/g')

  🌐 GitHub Pages: https://stopsopa.github.io/ace-editor-webcomponent/

  💻 local dev server (node server.js / yarn start):
       http://localhost:3000
       http://localhost:3000/learning/

  🎨 prettier config: prettier.config.cjs (ignored paths: .prettierignore)

EEE
`,
      description: "What is this project: links and local urls",
      confirm: false,
    },
    [`style:check`]: {
      command: `
set -e
./node_modules/.bin/prettier --config prettier.config.cjs --check .
`,
      description: `prettier: check formatting of all files (fails if any file needs formatting)`,
      confirm: false,
    },
    [`style:fix`]: {
      command: `
set -e
./node_modules/.bin/prettier --config prettier.config.cjs --write .
`,
      description: `prettier: format all files in place`,
    },
    [`style:list`]: {
      command: `
set -e
./node_modules/.bin/prettier --config prettier.config.cjs --list-different .
`,
      description: `prettier: list files which need formatting`,
      confirm: false,
    },

    ...setup,
  };
};
