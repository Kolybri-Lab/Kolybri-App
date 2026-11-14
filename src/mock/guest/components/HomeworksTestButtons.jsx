import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { queryClient } from "@/provider/QueryProvider";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { resetGuestHomeworks, setGuestHomeworksEmpty } from "../guestData";

export default function HomeworksTestButtons() {
    const { colors } = useTheme();
    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color={colors.text.secondary}>
                📚 DEVOIRS
            </Text>

            <TouchableOpacity
                onPress={() => {
                    setGuestHomeworksEmpty(true);
                    queryClient.invalidateQueries({ queryKey: ["homeworks"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    📭 Devoirs : Simuler Aucune Donnée
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    useCustomDataStore.getState().clearCustomHomeworks();
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🗑️ Supprimer tous les devoirs personnalisés
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    resetGuestHomeworks();
                    useCustomDataStore.getState().clearCustomHomeworks();
                    queryClient.invalidateQueries({ queryKey: ["homeworks"] });
                }}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.success, 0.15),
                }}
            >
                <Text size={13} color={colors.state.success}>
                    🔄 Reset Tests Devoirs
                </Text>
            </TouchableOpacity>
        </View>
    );
}
