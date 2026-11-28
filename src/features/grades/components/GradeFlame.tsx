import { FlameOrangeLottie, FlamePurpleLottie } from "@/components/lottie";
import { useTheme } from "@/hooks/useThemeStore";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";

const ASPECT_RATIO = 1.34;

const FLAME_COMPONENTS: Record<string, typeof FlameOrangeLottie> = {
    orange: FlameOrangeLottie,
    purple: FlamePurpleLottie,
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
    const FlameLottie = FLAME_COMPONENTS[color] || FLAME_COMPONENTS.orange;

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
            <FlameLottie
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
        // Intentional fixed white text over the flame SVG illustration
        color: "#FFFFFF",
    },
    flammeSubText: {
        fontFamily: "SemiBold",
    },
});
