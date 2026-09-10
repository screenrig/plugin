import { handleBrowserSetup } from "../commands.js";
export function registerBrowserCommands(root, bind) {
    const browser = root.command("browser").description("Complete browser Player setup");
    browser.command("setup").description("Complete browser setup from a code")
        .requiredOption("--code <CODE>", "Use the browser setup code (required)")
        .option("--open", "Open the result in its viewer")
        .action(bind(handleBrowserSetup));
}
//# sourceMappingURL=browser.js.map