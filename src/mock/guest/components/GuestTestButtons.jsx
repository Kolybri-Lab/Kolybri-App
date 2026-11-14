import { Text } from "@/components";
import { useErrorStore } from "@/hooks/useErrorStore";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { withAlpha } from "@/themes/color";
import React from "react";
import { DevSettings, TouchableOpacity, View } from "react-native";
import AnnouncementsTestButtons from "./AnnouncementsTestButtons";
import ErrorsTestButtons from "./ErrorsTestButtons";
import GradesTestButtons from "./GradesTestButtons";
import HomeworksTestButtons from "./HomeworksTestButtons";
import TimetableTestButtons from "./TimetableTestButtons";

export default function GuestTestButtons() {
    const token = useUserStore((state) => state.token);
    const { colors } = useTheme();

    if (token !== "guest_token") {
        return null;
    }

    return (
        <View
            style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 16,
                backgroundColor: colors.surface.default,
                borderWidth: 1,
                borderColor: colors.border.subtle,
                width: "100%",
                gap: 14,
            }}
        >
            <Text size={16} color={colors.text.primary}>
                🧪 Panneau de Test Développeur
            </Text>

            <TimetableTestButtons />
            <GradesTestButtons />
            <HomeworksTestButtons />
            <ErrorsTestButtons />
            <AnnouncementsTestButtons />

            {/* --- REDÉMARRAGE DE L'APPLICATION --- */}
            <TouchableOpacity
                onPress={() => {
                    useErrorStore.getState().clearAll();
                    DevSettings.reload();
                }}
                style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                    borderWidth: 1,
                    borderColor: withAlpha(colors.brand.primary, 0.35),
                    marginTop: 4,
                }}
            >
                <Text
                    size={13}
                    color={colors.brand.primary}
                    style={{ textAlign: "center", fontFamily: "SemiBold" }}
                >
                    🔁 Redémarrer l'application
                </Text>
            </TouchableOpacity>
        </View>
    );
}
