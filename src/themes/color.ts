import type { SubjectColor } from "@/types";
import { hslToRgb, parseToRgb, rgbToHsl } from "@/utils/colorGenerator";

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

const toLinear = (c: number): number => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
};

const relativeLuminance = (h: number, s: number, l: number): number => {
    const [r, g, b] = hslToRgb(h, s / 100, l / 100);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const findLightnessForLuminance = (
    h: number,
    s: number,
    targetY: number,
    minL = 0,
    maxL = 100
): number => {
    let lo = 0;
    let hi = 100;
    for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        if (relativeLuminance(h, s, mid) < targetY) lo = mid;
        else hi = mid;
    }
    return Math.max(minL, Math.min(maxL, Math.round((lo + hi) / 2)));
};

/**
 * Generates theme-adapted light and dark variants for a subject hue.
 * - light: S=82%, Y=0.30 clamped [48%, 62%] (punchy/vivid on white cards).
 * - dark:  S=80%, Y=0.35 clamped [54%, 64%] (uniform tinted cards over neutral dark).
 */
export const generateSubjectColor = (hue: number): SubjectColor => {
    const h = Math.round(((hue % 360) + 360) % 360);
    const lightL = findLightnessForLuminance(h, 82, 0.3, 48, 62);
    const darkL = findLightnessForLuminance(h, 80, 0.35, 54, 64);
    return {
        light: `hsl(${h}, 82%, ${lightL}%)`,
        dark: `hsl(${h}, 80%, ${darkL}%)`,
    };
};

