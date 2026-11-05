import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    DevSettings,
    ScrollView,
} from "react-native";
import { TriangleAlert, RotateCcw } from "lucide-react-native";

export function CrashScreen({
    error,
    onRestart,
}: {
    error?: Error | null;
    onRestart?: () => void;
}) {
    const handleRestart = () => {
        if (onRestart) {
            onRestart();
        } else {
            DevSettings.reload();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TriangleAlert size={100} color="#FF4D4D" strokeWidth={2} />
                <Text style={styles.title}>Une erreur est survenue</Text>
                <Text style={styles.subtitle}>
                    L'application a rencontré un problème inattendu.
                </Text>
                {error?.message && (
                    <ScrollView
                        style={styles.errorMessageContainer}
                        contentContainerStyle={{ padding: 12 }}
                    >
                        <Text style={styles.errorMessage}>{error.message}</Text>
                    </ScrollView>
                )}
                <TouchableOpacity
                    onPress={handleRestart}
                    style={styles.button}
                    activeOpacity={0.8}
                >
                    <RotateCcw
                        size={18}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.buttonText}>Redémarrer l'application</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0C0C20",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    content: {
        alignItems: "center",
        maxWidth: 340,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 16,
        textAlign: "center",
    },
    subtitle: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
    errorMessageContainer: {
        marginTop: 12,
        backgroundColor: "rgba(255, 77, 77, 0.1)",
        borderRadius: 8,
        maxHeight: "60%",
        flexGrow: 0,
        width: "100%",
    },
    errorMessage: {
        color: "rgba(255, 77, 77, 0.8)",
        fontSize: 12,
        textAlign: "center",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#6382FF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 24,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 14,
    },
});

export default CrashScreen;

