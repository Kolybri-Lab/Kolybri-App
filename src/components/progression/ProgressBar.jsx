import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

const clamp01 = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

const progressToColor = (p) => {
    "worklet";
    const x = p * 2; // 0..2
    const r = x < 1 ? 255 : Math.round((2 - x) * 255);
    const g = x < 1 ? Math.round(x * 255) : 255;
    return ((r << 24) | (g << 16) | 0xff) >>> 0;
};

export const ProgressBar = ({
    progression,
    color = "auto",
    style,
    delay = 250,
    minWidth = 8,
}) => {
    const target = clamp01(progression);
    const isAuto = color === "auto";
    const trackWidth = useSharedValue(0);
    const progress = useSharedValue(0);
    const isFirstRun = useRef(true);

    useEffect(() => {
        const d = isFirstRun.current ? delay : 0;
        isFirstRun.current = false;

        progress.value = withDelay(
            d,
            withTiming(target, {
                duration: 1800,
                easing: Easing.out(Easing.cubic),
            })
        );
    }, [target, delay]);

    const fillStyle = useAnimatedStyle(() => {
        const w = trackWidth.value;
        const p = progress.value;
        const visible = Math.min(w, Math.max(minWidth, p * w));

        if (isAuto) {
            return {
                opacity: w === 0 ? 0 : 1,
                transform: [{ translateX: visible - w }],
                backgroundColor: progressToColor(p),
            };
        }
        return {
            opacity: w === 0 ? 0 : 1,
            transform: [{ translateX: visible - w }],
        };
    });

    return (
        <View
            onLayout={(e) => {
                trackWidth.value = e.nativeEvent.layout.width;
            }}
            style={[{ height: 20, borderRadius: 20, overflow: "hidden" }, style]}
        >
            <Animated.View
                style={[
                    {
                        width: "100%",
                        height: "100%",
                        borderRadius: 20,
                        // couleur fixe : statique, aucun coût par image
                        ...(isAuto ? null : { backgroundColor: color }),
                    },
                    fillStyle,
                ]}
            />
        </View>
    );
};

