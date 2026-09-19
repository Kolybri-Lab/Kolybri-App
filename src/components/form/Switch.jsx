import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function Switch({ value, onValueChange }) {
    const transitionProgress = useSharedValue(value ? 1 : 0);
    const { colors } = useTheme();
    useEffect(() => {
        transitionProgress.value = withTiming(value ? 1 : 0, {
            duration: 200,
            easing: Easing.inOut(Easing.quad),
        });
    }, [value]);

    const trackColorInactive = withAlpha(colors.surface.simpleOpacity, 0.1);
    const trackColorActive = withAlpha(colors.surface.simpleOpacity, 0.4);

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            transitionProgress.value,
            [0, 1],
            [trackColorInactive, trackColorActive]
        ),
    }));

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: transitionProgress.value * 20 }],
    }));

    return (
        <Pressable onPress={() => onValueChange(!value)} hitSlop={8}>
            <Animated.View
                style={[
                    {
                        width: 48,
                        height: 28,
                        borderRadius: 50,
                        padding: 3,
                        justifyContent: "center",
                    },
                    trackStyle,
                ]}
            >
                <Animated.View
                    style={[
                        {
                            width: 22,
                            height: 22,
                            borderRadius: 50,
                            backgroundColor: "white",
                        },
                        thumbStyle,
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
}

