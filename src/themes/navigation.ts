import type { Theme as NavigationTheme } from "@react-navigation/native";

import type { Theme } from "./themes";
import { fontFamily } from "./tokens";

// Convertit NOTRE thème en thème React Navigation (v7).
export function toNavigationTheme(theme: Theme): NavigationTheme {
    const { colors } = theme;
    return {
        dark: theme.isDark,
        colors: {
            primary: colors.brand.primary,
            background: colors.background.screen,
            card: colors.tabBar.background,
            text: colors.text.primary,
            border: colors.border,
            notification: colors.state.danger,
        },
        fonts: {
            regular: { fontFamily: fontFamily.body, fontWeight: "400" },
            medium: { fontFamily: fontFamily.bodyMedium, fontWeight: "500" },
            bold: { fontFamily: fontFamily.heading, fontWeight: "700" },
            heavy: { fontFamily: fontFamily.heading, fontWeight: "900" },
        },
    };
}
