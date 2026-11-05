// "hsl(h, s%, l%)" and "hsla(h, s%, l%, a)"
const HSL_RE =
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)$/;

export const withAlpha = (color: string, alpha: number): string => {
    const m = HSL_RE.exec(color.trim());
    if (!m) {
        if (__DEV__) console.warn(`withAlpha : "${color}" n'est pas du hsl/hsla`);
        return color;
    }
    const a = Math.min(1, Math.max(0, alpha));
    return `hsla(${m[1]}, ${m[2]}%, ${m[3]}%, ${a})`;
};

