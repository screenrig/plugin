import { handleProjectShow, handleProjectCapabilities, handleProjectRename } from "../commands.js";
import { addCommandNotes } from "./notes.js";
import { CREDIT_HELP } from "../help-text.js";
export function registerProjectCommands(root, bind) {
    const project = root.command("project").description("Inspect and name your project");
    addCommandNotes(project.command("show").description("Inspect your project and credits")
        .action(bind(handleProjectShow)), CREDIT_HELP);
    project.command("capabilities").description("Read this project's plan, feature flags, and effective capabilities")
        .action(bind(handleProjectCapabilities));
    project.command("rename").description("Rename this project")
        .argument("<NAME>", "Project display name")
        .action(bind(handleProjectRename));
}
//# sourceMappingURL=project.js.map