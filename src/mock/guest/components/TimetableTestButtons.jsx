import { Text } from "@/components";
import { queryClient } from "@/provider/QueryProvider";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
    resetGuestTimetable,
    setGuestTimetableEmpty,
    toggleGuestActiveCourse,
} from "../guestData";

export default function TimetableTestButtons() {
    return (
        <View style={{ gap: 8, width: "100%" }}>
            <Text size={13} color="rgba(255, 255, 255, 0.5)">
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
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                }}
            >
                <Text size={13} color="#60A5FA">
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
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                }}
            >
                <Text size={13} color="#FBBF24">
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
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                }}
            >
                <Text size={13} color="#34D399">
                    🔄 Reset Tests Emploi du Temps
                </Text>
            </TouchableOpacity>
        </View>
    );
}
