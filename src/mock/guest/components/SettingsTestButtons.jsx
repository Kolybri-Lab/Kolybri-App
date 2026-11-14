import { Text } from "@/components";
import { useTheme, useThemeStore } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function SettingsTestButtons() {
    const { colors } = useTheme();
    const themeMode = useThemeStore((state) => state.themeMode);
    const followSystem = useThemeStore((state) => state.followSystem);
    const systemTheme = useThemeStore((state) => state.systemTheme);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);

    const activeTheme = followSystem ? systemTheme : themeMode;

    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color={colors.text.secondary}>
                ⚙️ PARAMÈTRES
            </Text>

            <TouchableOpacity
                onPress={() => {
                    const nextTheme = activeTheme === "dark" ? "light" : "dark";
                    setThemeMode(nextTheme);
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    {activeTheme === "dark"
                        ? "☀️ Passer en Mode Clair"
                        : "🌙 Passer en Mode Sombre"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
