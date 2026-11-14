import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { queryClient } from "@/provider/QueryProvider";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
    resetGuestTimetable,
    setGuestTimetableEmpty,
    toggleGuestActiveCourse,
} from "../guestData";

export default function TimetableTestButtons() {
    const { colors } = useTheme();
    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color={colors.text.secondary}>
                📅 EMPLOI DU TEMPS
            </Text>

            <TouchableOpacity
                onPress={() => {
                    toggleGuestActiveCourse();
                    queryClient.invalidateQueries({ queryKey: ["timetable"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    ⏱️ Activer / Désactiver Cours en Cours (Test)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    setGuestTimetableEmpty(true);
                    queryClient.invalidateQueries({ queryKey: ["timetable"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    📭 EDT : Simuler Aucune Donnée
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    resetGuestTimetable();
                    queryClient.invalidateQueries({ queryKey: ["timetable"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.success, 0.15),
                }}
            >
                <Text size={13} color={colors.state.success}>
                    🔄 Reset Tests Emploi du Temps
                </Text>
            </TouchableOpacity>
        </View>
    );
}
