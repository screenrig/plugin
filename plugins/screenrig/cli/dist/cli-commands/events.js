import { positiveInteger } from "./options.js";
import { handleEventsList, handleEventsFollow } from "../commands.js";
import { Option } from "commander";
export function registerEventsCommands(root, bind) {
    const events = root.command("events").description("List or follow project events");
    events.command("list").description("List project events")
        .addOption(new Option("--after <CURSOR>", "Read events after this cursor").conflicts(["cursor"]))
        .addOption(new Option("--cursor <CURSOR>", "Alias for --after").conflicts(["after"]))
        .option("--limit <N>", "Limit returned events", positiveInteger("limit"))
        .action(bind(handleEventsList));
    events.command("follow").description("Stream project events")
        .addOption(new Option("--after <CURSOR>", "Read events after this cursor").conflicts(["cursor"]))
        .addOption(new Option("--cursor <CURSOR>", "Alias for --after").conflicts(["after"]))
        .action(bind(handleEventsFollow));
}
//# sourceMappingURL=events.js.map