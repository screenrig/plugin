import type { Writable } from "node:stream";
import { CliError } from "./problems.js";
import type { TransportByteStream } from "./transport/types.js";
/** GET /api/v1/playback/plays: to - from is at most 31 days (PlaysTo). */
export declare const PLAYS_MAX_RANGE_MS: number;
/** Server default when from is omitted: 24 hours before to. */
export declare const PLAYS_DEFAULT_RANGE_MS = 86400000;
export declare const PLAYS_LIMIT_MAX = 1000;
/** GET /api/v1/playback day_from to day_to spans at most 366 days (PlaybackDayFrom). */
export declare const AGGREGATE_MAX_DAYS = 366;
/** --all follows next_cursor for at most this many pages (each one billed request). */
export declare const PLAYS_ALL_MAX_PAGES = 50;
export declare const PLAYS_CURSOR_PATTERN: RegExp;
/**
 * A CSV stream fails after this long without a byte (headers included), not
 * after a whole-transfer deadline; the global --timeout overrides it.
 */
export declare const PLAYBACK_CSV_IDLE_TIMEOUT_MS = 60000;
/** The server holds back the newest plays: effective to is at most now - 5 s. */
export declare const PLAYS_SETTLE_MS = 5000;
/**
 * `--from`/`--to`: an RFC 3339 instant with seconds and an offset, normalized
 * to UTC, `now`, or a relative age such as 7d, 12h, or 30m before now.
 */
export declare function playsInstant(value: string, flag: "--from" | "--to", now: Date): number;
export declare function playsInstantOption(flag: "--from" | "--to"): (value: string) => string;
/**
 * Resolve the received_at window locally so every page of one export uses the
 * same bounds: to defaults to now, from to 24 hours before to.
 */
export declare function playsRange(from: string | undefined, to: string | undefined, now: Date): {
    from: string;
    to: string;
};
export declare function playsCursor(value: string): string;
export declare function playsLimit(value: string): string;
/** Split one CSV record (without its line ending) into cells, RFC 4180 quoting. */
export declare function csvCells(record: string): string[];
/**
 * Counts records in a streamed RFC 4180 body and keeps the header and the last
 * complete record. A newline inside a quoted cell does not end a record.
 */
export declare class CsvRecordCounter {
    records: number;
    header: string | undefined;
    last: string | undefined;
    /** Bytes seen, and the offset just past the last complete record. */
    bytes: number;
    completeBytes: number;
    private current;
    private quoted;
    push(chunk: Uint8Array): void;
    /** True when the body ended on a record boundary (the backend ends every record with CRLF). */
    get complete(): boolean;
    get rows(): number;
    /** Cells of the last complete data row (not the header). */
    lastRow(): string[] | undefined;
    headerCells(): string[];
}
export interface CsvFileResult {
    path: string;
    bytes: number;
    rows: number;
    sha256: string;
    header: string[];
    last: string[] | undefined;
}
/**
 * The stream failed after the 200: the server aborts the connection on a
 * mid-stream failure, and a body that stops mid-row is never complete.
 * Carries what was received so the caller can say how to resume.
 */
export declare class CsvStreamFailure extends CliError {
    readonly failure: CliError;
    readonly rows: number;
    readonly header: string[];
    readonly lastRow: string[] | undefined;
    /** File holding the complete rows received, never the requested path. */
    readonly partialPath?: string | undefined;
    constructor(failure: CliError, rows: number, header: string[], lastRow: string[] | undefined, 
    /** File holding the complete rows received, never the requested path. */
    partialPath?: string | undefined);
}
/** Refuse a success that is not the CSV the contract names (a proxy page, JSON). */
export declare function requireCsvResponse(headers: Record<string, string>, what: string, requestId?: string): void;
/**
 * `file` when it does not exist, else the first free `stem-2ext`, `stem-3ext`, ...
 * (`plays.csv.partial` → `plays.csv.partial-2`; `plays-rest.csv` → `plays-rest-2.csv`).
 */
export declare function unusedPath(file: string, extension?: string): Promise<string>;
/**
 * Stream the CSV body into a 0600 temp file beside the target, then rename it
 * into place only after a clean end on a record boundary. A transport failure
 * never renames onto the target: with `keepPartial` and at least one complete
 * row, the complete rows move to `<target>.partial`; otherwise the temp file is
 * removed. Bytes never reach stdout or the log.
 */
export declare function writeCsvFile(body: TransportByteStream, outputPath: string, what: string, requestId: string | undefined, keepPartial?: boolean): Promise<CsvFileResult>;
/** `--output -`: the CSV bytes are the whole of stdout. */
export declare function writeCsvStdout(body: TransportByteStream, stdout: Writable, what: string, requestId: string | undefined): Promise<void>;
/**
 * The tightest playback-export budget from a RateLimit response header
 * (`"playback-export-project";r=29;t=60, ...`): remaining requests and the
 * reset delay in seconds. Undefined when the response disclosed none.
 */
export declare function playbackExportBudget(header: string | undefined): {
    remaining: number;
    resetSeconds: number;
} | undefined;
//# sourceMappingURL=playback-export.d.ts.map