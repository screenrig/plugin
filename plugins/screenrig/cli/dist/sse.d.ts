export interface SseEvent {
    id?: string;
    event?: string;
    data?: string;
}
export declare function parseSse(buffer: string): {
    events: SseEvent[];
    rest: string;
};
//# sourceMappingURL=sse.d.ts.map