import { handleDashboard, handleSignInReset } from "../commands.js";
export function registerDashboardCommands(root, bind) {
    const dashboard = root.command("dashboard").description("Open the dashboard");
    dashboard.command("open", { isDefault: true }).description("Open the dashboard origin")
        .action(bind(handleDashboard));
    dashboard.command("reset-sign-in").description("Request emailed sign-in instructions")
        .requiredOption("--email <ADDRESS>", "Address to receive sign-in instructions")
        .action(bind(handleSignInReset));
}
//# sourceMappingURL=dashboard.js.map