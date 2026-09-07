import { parseArgv } from "./argv.js";
import { dispatch } from "./commands.js";
import { applyCreditsLowToSuccess, observedCreditsRemaining } from "./credits.js";
import { errorEnvelope } from "./envelope.js";
import { ExitCode } from "./exit-codes.js";
import { LOG_SINK_DEGRADED_CODE, logSinkDegradedWarning } from "./log/logger.js";
import { CliError, makeProblem, renderProblem } from "./problems.js";
import { redactText } from "./redact.js";
import { processRuntime } from "./runtime.js";
function appendLogSinkWarning(warnings, dropped) {
    const warning = logSinkDegradedWarning(dropped);
    if (!warning || warnings.some((item) => item.code === LOG_SINK_DEGRADED_CODE)) {
        return warnings;
    }
    return [...warnings, warning];
}
function applyLogSinkToSuccess(result, dropped) {
    const warnings = appendLogSinkWarning(result.envelope.warnings, dropped);
    if (warnings === result.envelope.warnings) {
        return result;
    }
    const warning = warnings[warnings.length - 1];
    const line = warning ? `warning: ${warning.message}` : "";
    const human = !result.human || !line || result.human.includes(line) ? result.human : `${result.human}\n${line}`;
    return { ...result, envelope: { ...result.envelope, warnings }, human };
}
export async function run(runtime = processRuntime()) {
    const json = runtime.argv.includes("--json");
    try {
        const args = parseArgv(runtime.argv);
        const dispatched = applyCreditsLowToSuccess(await dispatch(args, runtime), observedCreditsRemaining(runtime));
        runtime.logger?.endRun();
        const result = applyLogSinkToSuccess(dispatched, runtime.logger?.droppedLines() ?? 0);
        if (json || args.flags.json === true) {
            if (result.human) {
                runtime.stdout.write(`${JSON.stringify(result.envelope)}\n`);
            }
        }
        else if (result.human) {
            runtime.stdout.write(`${result.human}\n`);
        }
        return result.exitCode;
    }
    catch (err) {
        runtime.logger?.endRun(err);
        const problem = err instanceof CliError
            ? err.problem
            : makeProblem("unexpected_error", "Unexpected error", 500, redactText(err instanceof Error ? err.message : "unknown error"));
        const exitCode = err instanceof CliError ? err.exitCode : ExitCode.Unexpected;
        const warnings = appendLogSinkWarning(err instanceof CliError ? err.warnings : [], runtime.logger?.droppedLines() ?? 0);
        if (json) {
            runtime.stdout.write(`${JSON.stringify(errorEnvelope(problem, { warnings }))}\n`);
        }
        else {
            runtime.stderr.write(`${renderProblem(problem)}\n`);
            for (const warning of warnings) {
                runtime.stderr.write(`warning: ${warning.message}\n`);
            }
        }
        return exitCode;
    }
    finally {
        const logger = runtime.logger;
        if (logger) {
            try {
                await logger.close();
            }
            catch {
                // Socket close is best-effort after the command envelope is written.
            }
        }
    }
}
export { processRuntime };
//# sourceMappingURL=main.js.map