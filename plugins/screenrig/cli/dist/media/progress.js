export function silentProgressReporter() {
    return {
        start() { },
        update() { },
        finish() { },
        failed() { },
    };
}
export function formatClock(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return "--:--";
    }
    const whole = Math.floor(totalSeconds);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const seconds = whole % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
export function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
        return "0 B";
    }
    const units = ["B", "KiB", "MiB", "GiB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }
    const digits = unit === 0 || value >= 100 ? 0 : 1;
    return `${value.toFixed(digits)} ${units[unit]}`;
}
const CLEAR_LINE = "\u001b[2K\r";
function bar(fraction, width = 24) {
    const filled = Math.round(fraction * width);
    return `${"#".repeat(filled)}${"-".repeat(width - filled)}`;
}
export function createProgressReporter(options) {
    const throttleMs = options.throttleMs ?? (options.tty ? 200 : 2000);
    const stepPercent = options.stepPercent ?? 5;
    let info;
    let startedAt = 0;
    let lastEmitAt = 0;
    let lastPercent = -1;
    let wroteInPlaceLine = false;
    let reachedFull = false;
    const write = (text) => {
        options.stderr.write(text);
    };
    const emitJson = (payload) => {
        write(`${JSON.stringify(payload)}\n`);
    };
    const clearInPlace = () => {
        if (wroteInPlaceLine) {
            write(CLEAR_LINE);
            wroteInPlaceLine = false;
        }
    };
    return {
        start(next) {
            info = next;
            startedAt = options.now();
            lastEmitAt = 0;
            lastPercent = -1;
            reachedFull = false;
            if (options.json) {
                emitJson({
                    event: "transcode_start",
                    stage: next.stage,
                    target: next.target,
                    source_bytes: next.sourceBytes,
                    duration_seconds: next.durationSeconds > 0 ? Number(next.durationSeconds.toFixed(3)) : undefined,
                    width: next.width,
                    height: next.height,
                });
                return;
            }
            const size = `${next.width}x${next.height}`;
            const length = next.durationSeconds > 0 ? `, ${formatClock(next.durationSeconds)}` : "";
            write(`screenrig: transcoding ${next.stage} to ${next.target} (${size}${length}, ${formatBytes(next.sourceBytes)})\n`);
        },
        update(rawFraction) {
            if (!info || reachedFull) {
                return;
            }
            const fraction = Math.min(1, Math.max(0, Number.isFinite(rawFraction) ? rawFraction : 0));
            const percent = Math.floor(fraction * 100);
            const nowMs = options.now();
            const elapsedMs = nowMs - startedAt;
            if (percent >= 100) {
                reachedFull = true;
            }
            else {
                if (nowMs - lastEmitAt < throttleMs) {
                    return;
                }
                if (!options.tty && percent - lastPercent < stepPercent) {
                    return;
                }
                if (percent === lastPercent) {
                    return;
                }
            }
            lastEmitAt = nowMs;
            lastPercent = percent;
            const etaSeconds = fraction > 0.01 ? ((elapsedMs / fraction) * (1 - fraction)) / 1000 : Number.NaN;
            if (options.json) {
                emitJson({
                    event: "transcode_progress",
                    stage: info.stage,
                    percent,
                    elapsed_seconds: Number((elapsedMs / 1000).toFixed(1)),
                    eta_seconds: Number.isFinite(etaSeconds) ? Number(etaSeconds.toFixed(1)) : undefined,
                });
                return;
            }
            const line = `screenrig: transcode ${bar(fraction)} ${String(percent).padStart(3)}% ` +
                `elapsed ${formatClock(elapsedMs / 1000)} eta ${formatClock(etaSeconds)}`;
            if (options.tty) {
                write(`${CLEAR_LINE}${line}`);
                wroteInPlaceLine = true;
            }
            else {
                write(`${line}\n`);
            }
        },
        finish(result) {
            clearInPlace();
            if (options.json) {
                emitJson({
                    event: "transcode_complete",
                    output_bytes: result.outputBytes,
                    elapsed_seconds: Number((result.elapsedMs / 1000).toFixed(1)),
                });
                return;
            }
            write(`screenrig: transcode complete in ${formatClock(result.elapsedMs / 1000)} ` +
                `(${formatBytes(result.outputBytes)})\n`);
        },
        failed() {
            clearInPlace();
        },
    };
}
//# sourceMappingURL=progress.js.map