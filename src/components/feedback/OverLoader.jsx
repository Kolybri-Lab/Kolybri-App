import { useTheme } from "@/hooks/useThemeStore";
import { useEffect } from "react";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import LoadingSpinner from "./LoadingSpinner";

export default function OverLoader({
    annimationStartTiming, // in ms (1000 ex)
    bgOpacityValue, // float or int <1
    triggerStateArr, // [triggerState, setTriggerState]
    triggerViewArr, // [triggerView, setTriggerView]
    loaderStyles, // stylesheet -> object
    svgSize = 70,
}) {
    if (
        bgOpacityValue > 1 ||
        bgOpacityValue < 0 ||
        typeof bgOpacityValue !== "number"
    ) {
        console.error("OverLoader: 'bgOpacityValue' doit être entre 0 et 1");
    }

    const [triggerState, setTriggerState] = triggerStateArr;
    const [triggerView, setTriggerView] = triggerViewArr;

    const loadingOpacity = useSharedValue(0);
    const backgroundProgress = useSharedValue(0); // 0 -> 1

    const loadingOpacityDynamicStyle = useAnimatedStyle(() => ({
        opacity: loadingOpacity.value,
    }));

    const backgroundLoadingOpacityDynamicStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            backgroundProgress.value,
            [0, 1],
            ["rgba(10, 10, 10, 0)", `rgba(10, 10, 10, ${bgOpacityValue})`]
        ),
    }));

    useEffect(() => {
        if (triggerState !== null) {
            if (triggerState) {
                setTriggerView(true);

                loadingOpacity.value = withTiming(1, {
                    duration: annimationStartTiming,
                });
                backgroundProgress.value = withTiming(1, {
                    duration: annimationStartTiming,
                });
            } else {
                loadingOpacity.value = withTiming(0, {
                    duration: annimationStartTiming,
                });
                backgroundProgress.value = withTiming(
                    0,
                    { duration: annimationStartTiming },
                    (finished) => {
                        if (finished) {
                            scheduleOnRN(setTriggerView, false);
                        }
                    }
                );
            }
        }

        return () => setTriggerState(null);
    }, [triggerState]);
    const { colors } = useTheme();

    return (
        triggerView && (
            <Animated.View
                style={[loaderStyles, backgroundLoadingOpacityDynamicStyle]}
            >
                <Animated.View
                    style={[
                        loadingOpacityDynamicStyle,
                        {
                            backgroundColor: colors.surface.raised,
                            borderRadius: 12,
                            padding: 8,
                            borderColor: colors.border.strong,
                            borderWidth: 1.1,
                        },
                    ]}
                >
                    <LoadingSpinner size={svgSize} />
                </Animated.View>
            </Animated.View>
        )
    );
}
