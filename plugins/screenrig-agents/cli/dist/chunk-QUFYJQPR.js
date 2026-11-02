import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);

// dist/cli-commands/subcommand.js
function subcommand(parent, name, options) {
  return parent.command(name, options);
}

export {
  subcommand
};
