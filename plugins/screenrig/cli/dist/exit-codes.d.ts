export declare const ExitCode: {
    readonly Success: 0;
    readonly Unexpected: 1;
    readonly Usage: 2;
    readonly Auth: 3;
    readonly NotFound: 4;
    readonly Conflict: 5;
    readonly Precondition: 6;
    readonly RateLimited: 7;
    readonly Client: 8;
    readonly Server: 9;
    readonly Network: 10;
    readonly Timeout: 11;
    readonly Config: 12;
    readonly OperationFailed: 13;
};
export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];
export declare function exitCodeForStatus(status: number): ExitCode;
//# sourceMappingURL=exit-codes.d.ts.map