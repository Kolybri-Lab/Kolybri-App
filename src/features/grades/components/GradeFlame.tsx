import { useTheme } from "@/hooks/useThemeStore";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

const ASPECT_RATIO = 1.34;

const FLAME_SOURCES: Record<string, any> = {
    orange: require("assets/lottie/flamme.json"),
    purple: require("assets/lottie/flamme2.json"),
};

interface GradeFlameProps {
    color?: "orange" | "purple" | string;
    value?: string | number;
    label?: string;
    width: number | string;
    style?: any;
}

export default function GradeFlame({
    color = "orange",
    value,
    label,
    width,
    style,
}: GradeFlameProps) {
    const { width: windowWidth } = useWindowDimensions();
    const { colors } = useTheme();
    const flameSource = FLAME_SOURCES[color] || FLAME_SOURCES.orange;

    let finalWidth: number;
    if (typeof width === "number") {
        finalWidth = width;
    } else if (typeof width === "string" && width.endsWith("%")) {
        finalWidth = (parseFloat(width) / 100) * windowWidth;
    } else {
        finalWidth = parseFloat(width as string) || 0;
    }

    const finalHeight = finalWidth * ASPECT_RATIO;
    const scale = finalWidth / 130;

    return (
        <View
            style={[
                styles.flammeContainer,
                { width: finalWidth, height: finalHeight },
                style,
            ]}
        >
            <LottieView
                source={flameSource}
                autoPlay
                loop
                style={[styles.flamme, { width: finalWidth, height: finalHeight }]}
            />
            {value !== undefined && (
                <Text
                    style={[
                        styles.flammeText,
                        {
                            fontSize: Math.round(28 * scale),
                            marginTop: Math.round(92 * scale),
                            marginLeft: Math.round(-5 * scale),
                        },
                    ]}
                >
                    {value}
                </Text>
            )}
            {label && (
                <Text
                    style={[
                        styles.flammeSubText,
                        {
                            fontSize: Math.round(24 * scale),
                            marginTop: Math.round(28 * scale),
                            color: colors.text.primary,
                        },
                    ]}
                >
                    {label}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flammeContainer: {
        flexDirection: "column",
        alignItems: "center",
    },
    flamme: {
        position: "absolute",
    },
    flammeText: {
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    flammeSubText: {
        fontFamily: "SemiBold",
    },
});
