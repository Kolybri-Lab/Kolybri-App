import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { queryClient } from "@/provider/QueryProvider";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { resetGuestGrades, setGuestGradesEmpty } from "../guestData";

export default function GradesTestButtons() {
    const { colors } = useTheme();
    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color={colors.text.secondary}>
                📝 NOTES
            </Text>

            <TouchableOpacity
                onPress={() => {
                    setGuestGradesEmpty(true);
                    queryClient.invalidateQueries({ queryKey: ["grades"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    📭 Notes : Simuler Aucune Donnée
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    resetGuestGrades();
                    queryClient.invalidateQueries({ queryKey: ["grades"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.success, 0.15),
                }}
            >
                <Text size={13} color={colors.state.success}>
                    🔄 Reset Tests Notes
                </Text>
            </TouchableOpacity>
        </View>
    );
}
