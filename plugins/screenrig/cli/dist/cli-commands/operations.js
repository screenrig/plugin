import { positiveInteger } from "./options.js";
import { handleOperationsGet, handleOperationsWait, handleOperationsCancel } from "../commands.js";
export function registerOperationsCommands(root, bind) {
    const operations = root.command("operations").description("Inspect, wait for, or cancel operations");
    operations.command("get").description("Inspect an operation")
        .argument("<id>", "Operation identifier")
        .action(bind(handleOperationsGet));
    operations.command("wait").description("Wait for an operation to finish")
        .argument("<id>", "Operation identifier")
        .option("--poll-ms <MS>", "Set the operation polling interval", positiveInteger("poll-ms"))
        .action(bind(handleOperationsWait));
    operations.command("cancel").description("Cancel an operation")
        .argument("<id>", "Operation identifier")
        .action(bind(handleOperationsCancel));
}
//# sourceMappingURL=operations.js.map