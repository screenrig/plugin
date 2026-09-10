import { handleVersion } from "../commands.js";
export function registerVersionCommands(root, bind) {
    root.command("version").description("Show CLI and protocol versions")
        .action(bind(handleVersion));
}
//# sourceMappingURL=version.js.map