const notes = new WeakMap();
/** Attach native help text and retain the same note for structured discovery. */
export function addCommandNotes(command, note) {
    command.addHelpText("after", `\n${note}`);
    notes.set(command, [...(notes.get(command) ?? []), note]);
}
export function commandNotes(command) {
    return [...(notes.get(command) ?? [])];
}
//# sourceMappingURL=notes.js.map