import { useTheme } from "@/hooks/useThemeStore";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export default function GradientBackground({ children }) {
    const { colors } = useTheme();
    const g = colors.background.gradient;

    let gradientColors = ["#000000", "#000000"];
    let locations = undefined;

    const rawGradient = colors.background.gradient;

    if (
        typeof rawGradient === "object" &&
        rawGradient !== null &&
        !Array.isArray(rawGradient)
    ) {
        gradientColors = rawGradient.colors;
        locations = rawGradient.locations;
    } else if (Array.isArray(rawGradient)) {
        const colorStrings = rawGradient.filter((item) => typeof item === "string");
        const numbers = rawGradient.filter((item) => typeof item === "number");

        gradientColors = colorStrings;

        if (numbers.length > 0) {
            if (numbers.length === 1 && colorStrings.length === 2) {
                locations = [0, numbers[0]];
            } else if (numbers.length === colorStrings.length) {
                locations = numbers;
            }
        }
    } else if (typeof rawGradient === "string") {
        gradientColors = [rawGradient, rawGradient];
    }

    return g ? (
        <LinearGradient
            colors={g.colors}
            locations={g.locations}
            style={StyleSheet.absoluteFill}
        >
            {children}
        </LinearGradient>
    ) : (
        <View
            style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background.screen },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});

