import type { TextStyle } from "react-native";

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

// Sur Android, `fontWeight` est ignoré avec une police personnalisée :
// il faut UN fichier de police par graisse.
// Remplacez par les vrais noms de vos fichiers (ex. "Luciole-Bold", "Lexend-Medium").
export const fontFamily = {
    heading: "Luciole-Regular",
    body: "Lexend-Regular",
    bodyMedium: "Lexend-Regular",
} as const;

// Variantes de texte : on choisit un rôle, pas une taille.
export const typography = {
    display: { fontFamily: fontFamily.heading, fontSize: 40, lineHeight: 48 },
    title: { fontFamily: fontFamily.heading, fontSize: 28, lineHeight: 32 },
    heading: { fontFamily: fontFamily.heading, fontSize: 20, lineHeight: 24 },
    body: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
    label: { fontFamily: fontFamily.bodyMedium, fontSize: 14, lineHeight: 20 },
    caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
