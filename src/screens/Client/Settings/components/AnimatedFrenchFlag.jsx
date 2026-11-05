import { FrenchFlag } from "@/components/svg";
import { useEffect, useMemo } from "react";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const random = (min, max) => Math.random() * (max - min) + min;

export default function AnimatedFrenchFlag({
    size = 60,
    baseRotation = 0,
    delay = 0,
}) {
    const { amplitude, duration, floatDistance, floatDuration } = useMemo(
        () => ({
            amplitude: random(6, 12),
            duration: random(1100, 1800),
            floatDistance: random(4, 9),
            floatDuration: random(1600, 2400),
        }),
        []
    );

    const rotation = useSharedValue(baseRotation);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
        scale.value = withDelay(
            delay,
            withTiming(1, {
                duration: 500,
                easing: Easing.out(Easing.back(1.5)),
            })
        );

        rotation.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(baseRotation + amplitude, {
                        duration,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    withTiming(baseRotation - amplitude, {
                        duration: duration * random(0.85, 1.15),
                        easing: Easing.inOut(Easing.sin),
                    })
                ),
                -1,
                true
            )
        );

        translateY.value = withDelay(
            delay + random(0, 300),
            withRepeat(
                withSequence(
                    withTiming(-floatDistance, {
                        duration: floatDuration,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    withTiming(floatDistance, {
                        duration: floatDuration,
                        easing: Easing.inOut(Easing.sin),
                    })
                ),
                -1,
                true
            )
        );
    }, [baseRotation, delay, amplitude, duration, floatDistance, floatDuration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <FrenchFlag size={size} />
        </Animated.View>
    );
}
