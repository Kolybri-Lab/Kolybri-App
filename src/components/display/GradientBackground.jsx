import { useTheme } from "@/hooks/useThemeStore";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export default function GradientBackground({ children }) {
    const { colors } = useTheme();
    const g = colors.background.gradient;

    if (!g) {
        return (
            <View
                style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: colors.background.screen },
                ]}
            >
                {children}
            </View>
        );
    }

    return (
        <LinearGradient
            colors={g.colors}
            locations={g.locations}
            style={StyleSheet.absoluteFill}
        >
            {children}
        </LinearGradient>
    );
}

