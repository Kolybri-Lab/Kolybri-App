import { Text } from "@/components";
import { useErrorStore } from "@/hooks/useErrorStore";
import { useUserStore } from "@/hooks/useUserStore";
import React from "react";
import { DevSettings, TouchableOpacity, View } from "react-native";
import ErrorsTestButtons from "./ErrorsTestButtons";
import GradesTestButtons from "./GradesTestButtons";
import HomeworksTestButtons from "./HomeworksTestButtons";
import TimetableTestButtons from "./TimetableTestButtons";

export default function GuestTestButtons() {
    const token = useUserStore((state) => state.token);

    if (token !== "guest_token") {
        return null;
    }

    return (
        <View
            style={{
                marginTop: 24,
                padding: 16,
                borderRadius: 16,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                width: "100%",
                gap: 14,
            }}
        >
            <Text size={16} color="hsla(1, 0%, 100%, 0.9)">
                🧪 Panneau de Test Développeur
            </Text>

            <TimetableTestButtons />
            <GradesTestButtons />
            <HomeworksTestButtons />
            <ErrorsTestButtons />

            {/* --- REDÉMARRAGE DE L'APPLICATION --- */}
            <TouchableOpacity
                onPress={() => {
                    useErrorStore.getState().clearAll();
                    DevSettings.reload();
                }}
                style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "rgba(59, 130, 246, 0.25)",
                    borderWidth: 1,
                    borderColor: "rgba(59, 130, 246, 0.4)",
                    marginTop: 4,
                }}
            >
                <Text
                    size={13}
                    color="#60A5FA"
                    style={{ textAlign: "center", fontFamily: "SemiBold" }}
                >
                    🔁 Redémarrer l'application
                </Text>
            </TouchableOpacity>
        </View>
    );
}
