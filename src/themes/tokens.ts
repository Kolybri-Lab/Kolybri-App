import type { Theme } from "@/types";

// Échelle de 4/8 px, identique à la grille Figma.
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const radius = {
    sm: 8,
    md: 16,
    lg: 24,
    pill: 999,
} as const;

// Sur Android, `fontWeight` est ignoré (ou provoque un fallback système) avec une police
// personnalisée : chaque graisse correspond à un fichier .ttf distinct enregistré dans assets/fonts/fonts.ts.
export const FONT_FAMILIES = {
    baloo: {
        regular: "Regular",
        medium: "Medium",
        semibold: "SemiBold",
        bold: "Bold",
        extrabold: "ExtraBold",
    },
    petrona: {
        regular: "Petrona-Regular",
        medium: "Petrona-Medium",
        semibold: "Petrona-SemiBold",
        bold: "Petrona-Bold",
        extrabold: "Petrona-ExtraBold",
    },
    luciole: {
        regular: "Luciole-Regular",
        medium: "Luciole-Regular",
        semibold: "Luciole-Regular",
        bold: "Luciole-Regular",
        extrabold: "Luciole-Regular",
    },
} as const;

export type FontFamily = keyof typeof FONT_FAMILIES;
export type FontWeight = keyof typeof FONT_FAMILIES.baloo;
export type TextColorRole = keyof Theme["colors"]["text"];

export function resolveFontFamily(
    family: FontFamily = "baloo",
    weight: FontWeight = "medium",
): string {
    const weights = FONT_FAMILIES[family] ?? FONT_FAMILIES.baloo;
    return weights[weight] ?? weights.medium;
}

// Ombres : le noir est le même dans les deux thèmes, seule l'intensité change.
// (`shadow` ne fait plus partie de `Theme`, on le dérive de `theme.isDark`.)
export const getShadow = (isDark: boolean) => ({
    color: "hsl(0, 0%, 0%)",
    opacity: isDark ? 0.3 : 0.14,
});

export type TypographyToken = {
    readonly fontSize: number;
    readonly lineHeight: number;
    readonly weight: FontWeight;
    readonly defaultColor: TextColorRole;
};

// Grille typographique V3 : 7 types sémantiques dérivés selon la densité/taille de chaque carte.
// Le champ `defaultColor` prépare la passe couleurs par profil (initialisé à "primary" partout).
export const typography = {
    "heading.hero": { fontSize: 32, lineHeight: 40, weight: "bold", defaultColor: "primary" },
    "heading.page": { fontSize: 24, lineHeight: 30, weight: "bold", defaultColor: "primary" },
    "heading.section": { fontSize: 20, lineHeight: 26, weight: "semibold", defaultColor: "primary" },

    "cardTitle.lg": { fontSize: 18, lineHeight: 24, weight: "bold", defaultColor: "primary" },
    "cardTitle.md": { fontSize: 16, lineHeight: 22, weight: "semibold", defaultColor: "primary" },
    "cardTitle.sm": { fontSize: 14, lineHeight: 18, weight: "bold", defaultColor: "primary" },

    "metric.xl": { fontSize: 32, lineHeight: 40, weight: "bold", defaultColor: "primary" },
    "metric.lg": { fontSize: 26, lineHeight: 33, weight: "bold", defaultColor: "primary" },
    "metric.md": { fontSize: 22, lineHeight: 28, weight: "bold", defaultColor: "primary" },
    "metric.sm": { fontSize: 16, lineHeight: 22, weight: "semibold", defaultColor: "primary" },
    "metric.xs": { fontSize: 14, lineHeight: 18, weight: "medium", defaultColor: "primary" },

    "body.lg": { fontSize: 16, lineHeight: 22, weight: "medium", defaultColor: "primary" },
    "body.md": { fontSize: 14, lineHeight: 20, weight: "medium", defaultColor: "primary" },
    "body.sm": { fontSize: 12, lineHeight: 16, weight: "medium", defaultColor: "primary" },

    "control.lg": { fontSize: 20, lineHeight: 26, weight: "semibold", defaultColor: "primary" },
    "control.md": { fontSize: 16, lineHeight: 22, weight: "semibold", defaultColor: "primary" },
    "control.sm": { fontSize: 14, lineHeight: 18, weight: "semibold", defaultColor: "primary" },
    "control.xs": { fontSize: 12, lineHeight: 16, weight: "medium", defaultColor: "primary" },

    "badge.md": { fontSize: 14, lineHeight: 18, weight: "semibold", defaultColor: "primary" },
    "badge.sm": { fontSize: 12, lineHeight: 16, weight: "semibold", defaultColor: "primary" },

    "meta.md": { fontSize: 14, lineHeight: 18, weight: "medium", defaultColor: "primary" },
    "meta.sm": { fontSize: 12, lineHeight: 16, weight: "medium", defaultColor: "primary" },
} as const satisfies Record<string, TypographyToken>;

export type TypographyPreset = keyof typeof typography;
