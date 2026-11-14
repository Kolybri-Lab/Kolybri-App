import { parseToRgb, rgbToHsl } from "@/utils/colorGenerator";

// "hsl(h, s%, l%)" and "hsla(h, s%, l%, a)"
const HSL_RE =
    /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)$/;

export const withAlpha = (color: string, alpha: number): string => {
    const a = Math.min(1, Math.max(0, alpha));
    const m = HSL_RE.exec(color.trim());
    if (m) {
        return `hsla(${m[1]}, ${m[2]}%, ${m[3]}%, ${a})`;
    }
    const [r, g, b] = parseToRgb(color);
    const [h, s, l] = rgbToHsl(r, g, b);
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
};

