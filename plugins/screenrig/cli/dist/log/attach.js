import { fetchSignedRawPut } from "../runtime.js";
import { commandWords, createSinkLogger, loggingSignedRawPut, noopLogger } from "./logger.js";
import { connectUnixLogSocket, DroppingLogSink } from "./socket.js";
function bindLogger(runtime, logger) {
    runtime.logger = logger;
    runtime.fs = { ...runtime.fs, logger };
    if (logger.enabled) {
        runtime.signedRawPut = loggingSignedRawPut(runtime.signedRawPut ?? fetchSignedRawPut(), logger);
    }
    logger.beginRun();
}
export async function attachOperationLogger(runtime, args, resolved) {
    const command = commandWords(args.positionals);
    if (runtime.logger) {
        runtime.logger.setCommand(command);
        bindLogger(runtime, runtime.logger);
        return;
    }
    const socketPath = resolved.logSocket;
    if (!socketPath) {
        runtime.logger = noopLogger;
        return;
    }
    let sink;
    try {
        sink = await connectUnixLogSocket(socketPath);
    }
    catch {
        sink = new DroppingLogSink();
    }
    const logger = createSinkLogger({
        sink,
        command,
        now: runtime.now,
    });
    bindLogger(runtime, logger);
}
//# sourceMappingURL=attach.js.map