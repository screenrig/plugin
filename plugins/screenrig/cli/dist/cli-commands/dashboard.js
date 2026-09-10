import { handleDashboard } from "../commands.js";
export function registerDashboardCommands(root, bind) {
    root.command("dashboard").description("Open the account dashboard")
        .option("--print-url", "Return the browser handoff URL")
        .action(bind(handleDashboard));
}
//# sourceMappingURL=dashboard.js.map