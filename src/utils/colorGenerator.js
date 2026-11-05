export function hslToRgb(h, s, l) {
    h = h % 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0,
        g = 0,
        b = 0;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

export function rgbToHsl(r, g, b) {
    let h, s, l;

    r /= 255;
    g /= 255;
    b /= 255;

    let cmax = Math.max(r, g, b);
    let cmin = Math.min(r, g, b);
    let delta = cmax - cmin;

    l = (cmax + cmin) / 2;

    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Gris pur (blanc, noir, gris) : pas de teinte. Évite NaN (0/0).
    if (delta === 0) return [0, 0, Math.round(l * 100)];

    switch (cmax) {
        case r:
            h = 60 * (((g - b) / delta) % 6);
            break;
        case g:
            h = 60 * ((b - r) / delta + 2);
            break;
        case b:
            h = 60 * ((r - g) / delta + 4);
            break;
    }

    if (h < 0) h += 360;

    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
const NAMED_COLORS = {
    transparent: [0, 0, 0, 0],
    white: [255, 255, 255],
    black: [0, 0, 0],
    red: [255, 0, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255],
    yellow: [255, 255, 0],
    orange: [255, 165, 0],
    purple: [128, 0, 128],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    lightgray: [211, 211, 211],
    lightgrey: [211, 211, 211],
    darkgray: [169, 169, 169],
    darkgrey: [169, 169, 169],
};

export const parseToRgb = (text) => {
    if (!text || typeof text !== "string") return [0, 0, 0];
    const str = text.trim().toLowerCase();

    // 1. Named colors
    if (NAMED_COLORS[str]) {
        return NAMED_COLORS[str].slice(0, 3);
    }

    // 2. Hex colors (#rgb, #rgba, #rrggbb, #rrggbbaa)
    if (str.startsWith("#")) {
        const hex = str.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return [r, g, b];
        }
        if (hex.length === 6 || hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return [r, g, b];
        }
    }

    // 3. HSL / HSLA (hsl(h, s%, l%) or hsla(h, s%, l%, a))
    if (str.startsWith("hsl")) {
        const matches = str.match(/[\d.]+/g);
        if (matches && matches.length >= 3) {
            const h = parseFloat(matches[0]);
            const s = parseFloat(matches[1]) / 100;
            const l = parseFloat(matches[2]) / 100;
            return hslToRgb(h, s, l);
        }
    }

    // 4. RGB / RGBA (rgb(r, g, b) or rgba(r, g, b, a))
    if (str.startsWith("rgb")) {
        const matches = str.match(/[\d.]+/g);
        if (matches && matches.length >= 3) {
            return [
                Math.round(parseFloat(matches[0])),
                Math.round(parseFloat(matches[1])),
                Math.round(parseFloat(matches[2])),
            ];
        }
    }

    // Fallback: match any 3 numbers if available
    const matches = str.match(/\d+/g);
    if (matches && matches.length >= 3) {
        return [parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2])];
    }

    return [0, 0, 0];
};

export const cssRgbToRgb = (text) => {
    return parseToRgb(text);
};

export const cssRgbToHsl = (text) => {
    const [r, g, b] = parseToRgb(text);
    const [h, s, l] = rgbToHsl(r, g, b);
    return [h, s, l];
};

export const cssHslaToHsla = (text) => {
    if (!text) return [0, 0, 0, 0];
    const values = text.match(/[\d.]+%?/g);

    if (!values || values.length < 4) {
        return [0, 0, 0, 0];
    }

    const [h, s, l, a] = values.map((v) =>
        v.includes("%") ? parseFloat(v) : parseFloat(v)
    );

    return [h, s, l, a];
};

export const isDarkColor = (hsl) => {
    if (!hsl) return false;
    const match = hsl.match(/,\s*(\d+)%\)$/);
    if (!match) return false;
    const lightness = parseFloat(match[1]);
    return lightness < 50;
};

const HSL_PARTS_RE = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i;

// Applique une opacité à n'importe quelle couleur et renvoie du hsla().
// - hsl()/hsla() : on garde les valeurs telles quelles (aucune perte).
// - autre format (rgb, hex, nom) : converti en HSL.
export const addOpacity = (text, a) => {
    if (a === undefined || a === null) a = 1;
    const opacity = a > 1 ? Math.min(1, a / 100) : Math.max(0, a);

    const m = typeof text === "string" ? HSL_PARTS_RE.exec(text.trim()) : null;
    if (m) return `hsla(${m[1]}, ${m[2]}%, ${m[3]}%, ${opacity})`;

    const [r, g, b] = parseToRgb(text);
    const [h, s, l] = rgbToHsl(r, g, b);
    return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
};

// Ancien nom conservé pour ne pas toucher aux imports existants.
export const addOpacityToCssRgb = addOpacity;

export const adjustLightness = (hslString, amount) => {
    if (!hslString) return "hsl(0, 0%, 50%)";
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) {
        return hslString; // Return original if not HSL
    }

    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);

    const newL = Math.max(0, Math.min(100, l + amount));

    return `hsl(${h}, ${s}%, ${newL}%)`;
};

export const adjustSaturation = (hslString, amount) => {
    if (!hslString) return "hsl(0, 0%, 50%)";
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) {
        return hslString;
    }

    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);

    const newS = Math.max(0, Math.min(100, s + amount));

    return `hsl(${h}, ${newS}%, ${l}%)`;
};

export const blendWithWhite = (hslColor, opacity = 0.35) => {
    const match = hslColor.match(
        /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/i
    );

    if (!match) return hslColor;

    const [, h, s, l] = match.map(Number);
    const [r, g, b] = hslToRgb(h, s / 100, l / 100);

    const blendedR = Math.round(r * opacity + 255 * (1 - opacity));
    const blendedG = Math.round(g * opacity + 255 * (1 - opacity));
    const blendedB = Math.round(b * opacity + 255 * (1 - opacity));

    return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
};

