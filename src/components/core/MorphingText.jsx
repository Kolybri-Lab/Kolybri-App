// components/core/MorphingText.js
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Text from "./Text";

const MorphingText = ({
    value,
    duration = 250,
    translateDistance = 6,
    style,
    ...textProps
}) => {
    const [displayedValue, setDisplayedValue] = useState(value);
    const prevValue = useRef(value);

    const progress = useSharedValue(1);

    useEffect(() => {
        if (value === prevValue.current) return;

        progress.value = 0;
        setDisplayedValue(value);
        prevValue.current = value;

        progress.value = withTiming(1, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [value]);

    const incomingStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: (1 - progress.value) * translateDistance }],
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[incomingStyle, { maxWidth: "100%" }]}>
                <Text
                    style={[{ textAlign: "center" }, style]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    {...textProps}
                >
                    {displayedValue}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        alignItems: "center",
        flexShrink: 1,
        minWidth: 0,
        maxWidth: "100%",
    },
});

export default MorphingText;
