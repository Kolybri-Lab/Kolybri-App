import { Text } from "@/components";
import { useThemeStore } from "@/hooks/useThemeStore";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function SettingsTestButtons() {
    const themeMode = useThemeStore((state) => state.themeMode);
    const followSystem = useThemeStore((state) => state.followSystem);
    const systemTheme = useThemeStore((state) => state.systemTheme);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);

    const activeTheme = followSystem ? systemTheme : themeMode;

    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color="rgba(255, 255, 255, 0.5)">
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
                    backgroundColor: "rgba(168, 85, 247, 0.2)",
                }}
            >
                <Text size={13} color="#C084FC">
                    {activeTheme === "dark"
                        ? "☀️ Passer en Mode Clair"
                        : "🌙 Passer en Mode Sombre"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
