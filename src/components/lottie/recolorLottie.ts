/**
 * AI-generated utility for recoloring Lottie JSON animations at runtime.
 *
 * How it works:
 * - Deep-clones a Lottie JSON object and replaces fill (`ty: "fl"`) and stroke (`ty: "st"`) colors
 *   using a `colorMap` whose keys can be:
 *   1. An exact asset/precomp, layer, or shape group name (`nm`, case-insensitive, innermost wins),
 *   2. A `#rrggbb` source hex color, or
 *   3. `"*"` as a monochrome wildcard (priority: name > `#rrggbb` > `"*"`).
 * - Traverses `layers` and precomp `assets[].layers` (recursing through `shapes` and `it`), updating
 *   color arrays `c.k` (`[r, g, b, a]` in `0..1`, both static `c.a !== 1` and animated keyframes `kf.s` / `kf.e`)
 *   and scaling opacity `o.k` (`0..100`, both static and animated keyframes) when the target color specifies an alpha < 1.
 * - Caches clones in a `WeakMap` keyed by `(source, colorMap)` so React re-renders keep the exact same
 *   object reference and do not restart animations.
 */
import { parseToRgb } from "@/utils/colorGenerator";

export type LottieColorMap = Record<string, string>;
export type LottieJson = Record<string, any>;

type ParsedTargetColor = {
    rgb: [number, number, number];
    alpha: number | null;
};

const recolorCache = new WeakMap<LottieJson, Map<string, LottieJson>>();

function parseTargetColor(cssColor: string): ParsedTargetColor {
    const [r, g, b] = parseToRgb(cssColor);
    const rgb: [number, number, number] = [r / 255, g / 255, b / 255];

    const str = cssColor.trim().toLowerCase();
    let alpha: number | null = null;

    if (str.startsWith("hsla") || str.startsWith("rgba")) {
        const matches = str.match(/[\d.]+/g);
        if (matches && matches.length >= 4) {
            alpha = Math.min(1, Math.max(0, parseFloat(matches[3])));
        }
    } else if (str.startsWith("#")) {
        const hex = str.slice(1);
        if (hex.length === 4) {
            alpha = parseInt(hex[3] + hex[3], 16) / 255;
        } else if (hex.length === 8) {
            alpha = parseInt(hex.slice(6, 8), 16) / 255;
        }
    }

    return { rgb, alpha };
}

function lottieColorToHex(arr: number[]): string | null {
    if (!Array.isArray(arr) || arr.length < 3 || typeof arr[0] !== "number") {
        return null;
    }
    const max = Math.max(arr[0], arr[1], arr[2]);
    const scale = max <= 1 ? 255 : 1;
    const toByte = (v: number) =>
        Math.round(Math.min(255, Math.max(0, v * scale)))
            .toString(16)
            .padStart(2, "0");

    return `#${toByte(arr[0])}${toByte(arr[1])}${toByte(arr[2])}`;
}

function replaceColorArray(
    arr: number[],
    target: ParsedTargetColor
): void {
    const max = Math.max(arr[0], arr[1], arr[2]);
    const scale = max > 1 ? 255 : 1;
    arr[0] = target.rgb[0] * scale;
    arr[1] = target.rgb[1] * scale;
    arr[2] = target.rgb[2] * scale;
}

function scaleOpacity(opacity: any, alpha: number): void {
    if (!opacity || typeof opacity !== "object") return;
    if (opacity.a !== 1 && typeof opacity.k === "number") {
        opacity.k = Math.round(opacity.k * alpha);
    } else if (Array.isArray(opacity.k)) {
        for (const kf of opacity.k) {
            if (!kf || typeof kf !== "object") continue;
            if (Array.isArray(kf.s) && typeof kf.s[0] === "number") {
                kf.s[0] = Math.round(kf.s[0] * alpha);
            }
            if (Array.isArray(kf.e) && typeof kf.e[0] === "number") {
                kf.e[0] = Math.round(kf.e[0] * alpha);
            }
        }
    }
}

function resolveTarget(
    arr: number[],
    normalizedMap: Map<string, ParsedTargetColor>,
    ancestors: string[]
): ParsedTargetColor | undefined {
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const byName = normalizedMap.get(ancestors[i]);
        if (byName) return byName;
    }

    const hex = lottieColorToHex(arr);
    if (hex) {
        const byHex = normalizedMap.get(hex);
        if (byHex) return byHex;
    }

    return normalizedMap.get("*");
}

function walkShapeNode(
    node: any,
    normalizedMap: Map<string, ParsedTargetColor>,
    ancestors: string[]
): void {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        for (const item of node) walkShapeNode(item, normalizedMap, ancestors);
        return;
    }

    const nextAncestors =
        typeof node.nm === "string" && node.nm.trim()
            ? [...ancestors, node.nm.trim().toLowerCase()]
            : ancestors;

    if ((node.ty === "fl" || node.ty === "st") && node.c?.k) {
        const k = node.c.k;

        if (node.c.a !== 1 && Array.isArray(k) && typeof k[0] === "number") {
            const target = resolveTarget(k, normalizedMap, nextAncestors);
            if (target) {
                replaceColorArray(k, target);
                if (target.alpha !== null && target.alpha < 1) {
                    scaleOpacity(node.o, target.alpha);
                }
            }
        } else if (Array.isArray(k)) {
            for (const kf of k) {
                if (!kf || typeof kf !== "object") continue;
                if (Array.isArray(kf.s) && typeof kf.s[0] === "number") {
                    const target = resolveTarget(
                        kf.s,
                        normalizedMap,
                        nextAncestors
                    );
                    if (target) replaceColorArray(kf.s, target);
                }
                if (Array.isArray(kf.e) && typeof kf.e[0] === "number") {
                    const target = resolveTarget(
                        kf.e,
                        normalizedMap,
                        nextAncestors
                    );
                    if (target) replaceColorArray(kf.e, target);
                }
            }
        }
    }

    if (node.shapes) walkShapeNode(node.shapes, normalizedMap, nextAncestors);
    if (node.it) walkShapeNode(node.it, normalizedMap, nextAncestors);
}

/**
 * Clones and recolors a Lottie JSON composition according to `colorMap`
 * (keys are exact layer/precomp/group names, `"#rrggbb"` hex values, or `"*"`,
 * values are CSS color strings).
 * Results are cached per `(source, serializedColorMap)` to preserve reference stability.
 */
export function recolorLottie(
    source: LottieJson,
    colorMap?: LottieColorMap
): LottieJson {
    if (!colorMap) return source;
    const entries = Object.entries(colorMap).filter(([, v]) => Boolean(v));
    if (entries.length === 0) return source;

    const sortedEntries = entries
        .map(([k, v]) => [k.trim().toLowerCase(), v] as const)
        .sort(([a], [b]) => a.localeCompare(b));

    const cacheKey = sortedEntries.map(([k, v]) => `${k}=${v}`).join("|");
    let sourceCache = recolorCache.get(source);
    if (!sourceCache) {
        sourceCache = new Map();
        recolorCache.set(source, sourceCache);
    }

    const cached = sourceCache.get(cacheKey);
    if (cached) return cached;

    const normalizedMap = new Map<string, ParsedTargetColor>();
    for (const [k, v] of sortedEntries) {
        normalizedMap.set(k, parseTargetColor(v));
    }

    const clone: LottieJson = JSON.parse(JSON.stringify(source));

    if (Array.isArray(clone.layers)) {
        for (const layer of clone.layers) {
            walkShapeNode(layer, normalizedMap, []);
        }
    }
    if (Array.isArray(clone.assets)) {
        for (const asset of clone.assets) {
            if (Array.isArray(asset?.layers)) {
                const assetAncestors =
                    typeof asset.nm === "string" && asset.nm.trim()
                        ? [asset.nm.trim().toLowerCase()]
                        : [];
                for (const layer of asset.layers) {
                    walkShapeNode(layer, normalizedMap, assetAncestors);
                }
            }
        }
    }

    sourceCache.set(cacheKey, clone);
    return clone;
}
