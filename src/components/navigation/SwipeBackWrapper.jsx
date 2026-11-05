// src/components/navigation/SwipeBackWrapper.js
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function SwipeBackWrapper({
    children,
    useOpacity = true,
    direction = "right",
}) {
    const navigation = useNavigation();
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    const goBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const gesture = Gesture.Pan()
        .cancelsTouchesInView(false)
        .activeOffsetX(direction === "right" ? [20, 9999] : [-9999, -20])
        .failOffsetY([-25, 25])
        .onUpdate((event) => {
            if (
                (direction === "right" && event.translationX > 0) ||
                (direction === "left" && event.translationX < 0)
            ) {
                translateX.value = event.translationX;

                if (useOpacity) {
                    const progress = Math.min(Math.abs(event.translationX) / 300, 1);
                    opacity.value = Math.max(0.3, 1 - progress);
                }
            }
        })
        .onEnd((event) => {
            const dir = direction === "right" ? 1 : -1;

            const shouldGoBack =
                event.translationX * dir > 100 || event.velocityX * dir > 200;

            if (shouldGoBack) {
                translateX.value = withSpring(direction === "right" ? 400 : -400, {
                    damping: 20,
                    stiffness: 200,
                });
                if (useOpacity) opacity.value = withSpring(0);
                setTimeout(() => scheduleOnRN(goBack), 150);
            } else {
                translateX.value = withSpring(0);
                if (useOpacity) opacity.value = withSpring(1);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
}

