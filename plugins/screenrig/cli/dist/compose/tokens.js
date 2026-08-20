import { ROLES, SPACES } from "./types.js";
export { PINS, ROLES, SPACES } from "./types.js";
export function spaceScale(canvasWidth, canvasHeight) {
    const root = Math.min(canvasWidth, canvasHeight);
    const s = Math.max(8, Math.round(root / 68));
    return {
        xs: Math.max(4, Math.round(s / 2)),
        s,
        m: Math.round(s * 1.5),
        l: s * 3,
        xl: s * 4,
    };
}
export function typeRamp(canvasWidth, canvasHeight) {
    const root = Math.min(canvasWidth, canvasHeight);
    const display = Math.max(64, Math.round(root * 0.12));
    const title = Math.max(48, Math.round(root * 0.08));
    const body = Math.max(32, Math.round(root * 0.042));
    const caption = Math.max(22, Math.round(root * 0.03));
    const min = (wish) => Math.max(18, Math.round(wish * 0.5));
    return {
        display: { wish: display, min: min(display), weight: "700" },
        title: { wish: title, min: min(title), weight: "700" },
        body: { wish: body, min: min(body), weight: "400" },
        caption: { wish: caption, min: min(caption), weight: "400" },
        label: { wish: caption, min: min(caption), weight: "700" },
    };
}
export function resolveSpace(token, scale, path) {
    if (token == null)
        return 0;
    if (!SPACES.includes(token)) {
        const err = new Error(`${path} spacing must be ${SPACES.join("|")}, got ${token}`);
        err.code = "usage_error";
        throw err;
    }
    return scale[token];
}
export function isRole(value) {
    return ROLES.includes(value);
}
//# sourceMappingURL=tokens.js.map