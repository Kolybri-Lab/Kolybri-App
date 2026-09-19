import { useTheme } from "@react-navigation/native";
import { useMemo } from "react";
import { Text as RNText, StyleSheet } from "react-native";

const FONT_WEIGHT_MAP = {
    light: "Lexend-Light",
    normal: "Lexend-Regular",
    medium: "Lexend-Medium",
    semibold: "Lexend-SemiBold",
    bold: "Lexend-Bold",
};

const PRESETS_VARIANTS = StyleSheet.create({
    /* ──────────────────────────────
   LABELS — small contextual texts
  ────────────────────────────── */
    label1: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: FONT_WEIGHT_MAP.medium,
    },
    label2: {
        fontSize: 14,
        lineHeight: 18,
        fontFamily: FONT_WEIGHT_MAP.normal,
    },
    label3: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: FONT_WEIGHT_MAP.light,
    },

    /* ──────────────────────────────
   BODY — main paragraph text
  ────────────────────────────── */
    body1: {
        fontSize: 16,
        lineHeight: 22,
        fontFamily: FONT_WEIGHT_MAP.normal,
    },
    body2: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: FONT_WEIGHT_MAP.light,
    },
    body3: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: FONT_WEIGHT_MAP.light,
    },

    /* ──────────────────────────────
   TITLES — section or block titles
  ────────────────────────────── */
    title1: {
        fontSize: 18,
        lineHeight: 24,
        fontFamily: FONT_WEIGHT_MAP.medium,
    },
    title2: {
        fontSize: 16,
        lineHeight: 22,
        fontFamily: FONT_WEIGHT_MAP.medium,
    },

    /* ──────────────────────────────
   HEADINGS — primary headers
  ────────────────────────────── */
    h1: {
        fontSize: 32,
        lineHeight: 40,
        fontFamily: FONT_WEIGHT_MAP.bold,
    },
    h2: {
        fontSize: 28,
        lineHeight: 36,
        fontFamily: FONT_WEIGHT_MAP.bold,
    },
    h3: {
        fontSize: 24,
        lineHeight: 32,
        fontFamily: FONT_WEIGHT_MAP.medium,
    },
    h4: {
        fontSize: 20,
        lineHeight: 26,
        fontFamily: FONT_WEIGHT_MAP.medium,
    },

    /* ──────────────────────────────
   CAPTIONS — small helper texts
  ────────────────────────────── */
    caption: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: FONT_WEIGHT_MAP.light,
    },

    /* ──────────────────────────────
   BUTTONS — action text styles
  ────────────────────────────── */
    button: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: FONT_WEIGHT_MAP.medium,
        textTransform: "uppercase",
    },
    /* ──────────────────────────────
   CUSTOMS — 
  ────────────────────────────── */

    custom1: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: FONT_WEIGHT_MAP.light,
    },
    custom2: {
        fontSize: 24,
        lineHeight: 32,
        fontFamily: FONT_WEIGHT_MAP.light,
    },
});

const ALIGNMENT_STYLES = StyleSheet.create({
    left: { textAlign: "left" },
    center: { textAlign: "center" },
    right: { textAlign: "right" },
    justify: { textAlign: "justify" },
});

const styleCache = new Map();
const MAX_CACHE_SIZE = 500;

const cleanupCache = () => {
    if (styleCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(styleCache.entries());
        styleCache.clear();
        entries.slice(-250).forEach(([key, value]) => {
            styleCache.set(key, value);
        });
    }
};

/**
 * @param {Object} props
 * @param {import("react").ReactNode} [props.children]
 * @param {"label1"|"label2"|"label3"|"title1"|"body1"|"h1"|"h2"|"h3"|"caption"|"button"} [props.preset]
 * @param {string} [props.color]
 * @param {number} [props.size=14]
 * @param {"light"|"normal"|"medium"|"semibold"|"bold"} [props.weight="normal"]
 * @param {"left"|"center"|"right"|"justify"} [props.align="left"]
 * @param {"line-through"|"underline"|"none"} [props.decoration]
 * @param {boolean} [props.oneLine]
 * @param {boolean} [props.inline]
 * @param {Object|Array} [props.style]
 */

export default function Text({
    preset,
    color: colorProp,
    size = 14,
    weight = "normal",
    align = "left",
    decoration,
    oneLine,
    inline,
    style: styleProp,
    children,
    ...props
}) {
    const theme = useTheme();
    const { colors } = theme;

    const cacheKey = useMemo(() => {
        if (styleProp) return null;

        return [
            preset || "no-preset",
            colorProp || "default",
            size,
            weight,
            align,
            decoration || "",
            inline ? "inline" : "",
            colors.txt?.txt1 || colors.text || "#000",
        ]
            .filter(Boolean)
            .join("-");
    }, [
        preset,
        colorProp,
        size,
        weight,
        align,
        decoration,
        inline,
        colors.txt,
        colors.text,
        styleProp,
    ]);

    const computedStyle = useMemo(() => {
        if (cacheKey) {
            const cached = styleCache.get(cacheKey);
            if (cached) return cached;
        }

        const flattenedProp = StyleSheet.flatten(styleProp) || {};
        const defaultColor = colors.txt?.txt1 || colors.text || "#000000";

        let dynamicStyle;

        if (preset) {
            const presetStyle = PRESETS_VARIANTS[preset] || {};
            const baseSize = presetStyle.fontSize || 14;

            dynamicStyle = {
                ...presetStyle,
                ...ALIGNMENT_STYLES[align],
                color: colorProp || flattenedProp.color || defaultColor,
                ...(size !== 14 && { fontSize: size }),
                ...(weight !== "normal" && { fontFamily: FONT_WEIGHT_MAP[weight] }),
                ...(decoration && { textDecorationLine: decoration }),
                ...(inline && { lineHeight: size !== 14 ? size : baseSize }),
                includeFontPadding: false,
            };
        } else {
            dynamicStyle = {
                ...ALIGNMENT_STYLES[align],
                color: colorProp || flattenedProp.color || defaultColor,
                fontSize: size,
                fontFamily: FONT_WEIGHT_MAP[weight],
                ...(decoration && { textDecorationLine: decoration }),
                ...(inline && { lineHeight: size }),
                includeFontPadding: false,
            };
        }

        const finalStyle = styleProp ? [dynamicStyle, flattenedProp] : dynamicStyle;

        if (cacheKey) {
            styleCache.set(cacheKey, finalStyle);
            cleanupCache();
        }

        return finalStyle;
    }, [
        cacheKey,
        preset,
        colorProp,
        size,
        weight,
        align,
        decoration,
        inline,
        styleProp,
        colors.txt,
        colors.text,
    ]);

    return (
        <RNText
            style={computedStyle}
            numberOfLines={oneLine ? 1 : props.numberOfLines}
            ellipsizeMode={oneLine ? "tail" : props.ellipsizeMode}
            {...props}
        >
            {children}
        </RNText>
    );
}

