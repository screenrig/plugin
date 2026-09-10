import { handleDoctor } from "../commands.js";
export function registerDoctorCommands(root, bind) {
    root.command("doctor").description("Check this CLI installation and configuration")
        .option("--repair-config", "Repair configuration permissions")
        .action(bind(handleDoctor));
}
//# sourceMappingURL=doctor.js.map