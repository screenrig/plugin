import { handleAccountShow } from "../commands.js";
import { addCommandNotes } from "./notes.js";
import { CREDIT_HELP } from "../help-text.js";
export function registerAccountCommands(root, bind) {
    const account = root.command("account").description("Inspect your account and credits");
    addCommandNotes(account.command("show").description("Inspect your account and credits")
        .action(bind(handleAccountShow)), CREDIT_HELP);
}
//# sourceMappingURL=account.js.map