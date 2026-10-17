import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const OPTIONS = [
    { value: "day", label: "Jour" },
    { value: "week", label: "Semaine" },
];

const PADDING = 4;

const SPRING = {
    damping: 24,
    stiffness: 240,
    mass: 0.9,
    overshootClamping: true,
};

const PRESS_SPRING = {
    damping: 18,
    stiffness: 320,
    mass: 0.6,
};

const clamp = (v, min, max) => {
    "worklet";
    return Math.min(max, Math.max(min, v));
};

export default function ViewSelector({ value, onChange }) {
    const { colors } = useTheme();

    const initial = value === "day" ? 0 : 1;
    const progress = useSharedValue(initial);
    const committed = useSharedValue(initial);
    const startProgress = useSharedValue(initial);
    const tabWidth = useSharedValue(0);

    useEffect(() => {
        const next = value === "day" ? 0 : 1;
        if (committed.value !== next) {
            committed.value = next;
            progress.value = withSpring(next, SPRING);
        }
    }, [value, committed, progress]);

    const pan = Gesture.Pan()
        .activeOffsetX([-6, 6])
        .failOffsetY([-14, 14])
        .onBegin(() => {
            startProgress.value = progress.value;
        })
        .onUpdate((e) => {
            if (tabWidth.value <= 0) return;
            progress.value = clamp(
                startProgress.value + e.translationX / tabWidth.value,
                0,
                1
            );
        })
        .onFinalize((e) => {
            if (tabWidth.value <= 0) return;
            const velocity = e.velocityX / tabWidth.value;
            const projected = progress.value + velocity * 0.12;
            const target = projected > 0.5 ? 1 : 0;
            progress.value = withSpring(target, { ...SPRING, velocity });
            if (committed.value !== target) {
                committed.value = target;
                scheduleOnRN(onChange, target === 0 ? "day" : "week");
            }
        });

    const pillStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: progress.value * tabWidth.value }],
    }));

    const handleSelect = (next) => {
        if (next !== value) onChange(next);
    };

    return (
        <GestureDetector gesture={pan}>
            <View
                onLayout={(e) => {
                    tabWidth.value =
                        (e.nativeEvent.layout.width - PADDING * 2) / OPTIONS.length;
                }}
                style={{
                    flexDirection: "row",
                    backgroundColor: colors.surface.raised,
                    borderRadius: 16,
                    padding: PADDING,
                }}
            >
                <Animated.View
                    pointerEvents="none"
                    style={[
                        {
                            position: "absolute",
                            top: PADDING,
                            bottom: PADDING,
                            left: PADDING,
                            width: `${100 / OPTIONS.length}%`,
                            marginRight: PADDING * 2,
                            borderRadius: 12,
                            backgroundColor: colors.surface.default,
                        },
                        pillStyle,
                    ]}
                />

                {OPTIONS.map((option) => (
                    <Tab
                        key={option.value}
                        label={option.label}
                        selected={value === option.value}
                        onPress={() => handleSelect(option.value)}
                    />
                ))}
            </View>
        </GestureDetector>
    );
}

function Tab({ label, selected, onPress }) {
    const pressed = useSharedValue(0);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: 1 - pressed.value * 0.05 }],
    }));

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => (pressed.value = withSpring(1, PRESS_SPRING))}
            onPressOut={() => (pressed.value = withSpring(0, PRESS_SPRING))}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{ flex: 1 }}
        >
            <Animated.View style={[{ alignItems: "center", padding: 10 }, style]}>
                <Text style={{ fontWeight: "600" }}>{label}</Text>
            </Animated.View>
        </Pressable>
    );
}
