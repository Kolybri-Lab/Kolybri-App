import type { Theme as NavigationTheme } from "@react-navigation/native";

import { Theme } from "@/types";
import { FONT_FAMILIES } from "./tokens";

// Convertit NOTRE thème en thème React Navigation (v7).
export function toNavigationTheme(theme: Theme): NavigationTheme {
    const { colors } = theme;
    return {
        dark: theme.isDark,
        colors: {
            primary: colors.brand.primary,
            background: colors.background.app,
            card: colors.surface.default,
            text: colors.text.primary,
            border: colors.border.subtle,
            notification: colors.state.warning,
        },
        fonts: {
            regular: { fontFamily: FONT_FAMILIES.baloo.regular, fontWeight: "normal" },
            medium: { fontFamily: FONT_FAMILIES.baloo.medium, fontWeight: "normal" },
            bold: { fontFamily: FONT_FAMILIES.baloo.bold, fontWeight: "normal" },
            heavy: { fontFamily: FONT_FAMILIES.baloo.extrabold, fontWeight: "normal" },
        },
    };
}
