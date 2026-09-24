export declare const RESOURCE_ID_PATTERNS: {
    project: RegExp;
    agent: RegExp;
    connection: RegExp;
    screen: RegExp;
    playlist: RegExp;
    release: RegExp;
    media: RegExp;
};
export type ResourceIDKind = keyof typeof RESOURCE_ID_PATTERNS;
export declare function isResourceID(value: unknown, kind: ResourceIDKind): value is string;
//# sourceMappingURL=resource-ids.d.ts.map