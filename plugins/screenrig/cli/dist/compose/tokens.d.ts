import { type Role, type SpaceScale, type SpaceToken, type TypeRamp } from "./types.js";
export { PINS, ROLES, SPACES } from "./types.js";
export declare function spaceScale(canvasWidth: number, canvasHeight: number): SpaceScale;
export declare function typeRamp(canvasWidth: number, canvasHeight: number): TypeRamp;
export declare function resolveSpace(token: SpaceToken | undefined, scale: SpaceScale, path: string): number;
export declare function isRole(value: string): value is Role;
//# sourceMappingURL=tokens.d.ts.map