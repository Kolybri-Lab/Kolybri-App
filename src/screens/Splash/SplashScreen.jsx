import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "@/components/core";

// Intentional fixed colors: rendered during native splash before ThemeProvider/theme store is ready
const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Text preset="heading.page" color="#FFFFFF">
                Bienvenue
            </Text>
            <ActivityIndicator size="large" color="#fff" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1E90FF",
    },
});

export default SplashScreen;

