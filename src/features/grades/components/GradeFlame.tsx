import { Text } from "@/components/core";
import { FlameOrangeLottie, FlamePurpleLottie } from "@/components/lottie";
import { StyleSheet, View, useWindowDimensions } from "react-native";

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
                    preset="metric.md"
                    size={Math.round(28 * scale)}
                    // Intentional fixed white text over the flame SVG illustration
                    color="#FFFFFF"
                    maxFontSizeMultiplier={1.15}
                    style={{
                        marginTop: Math.round(92 * scale),
                        marginLeft: Math.round(-5 * scale),
                    }}
                >
                    {value}
                </Text>
            )}
            {label && (
                <Text
                    preset="meta.md"
                    size={Math.round(24 * scale)}
                    weight="semibold"
                    maxFontSizeMultiplier={1.15}
                    style={{
                        marginTop: Math.round(28 * scale),
                    }}
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
});
