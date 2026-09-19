import { memo, useEffect } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useThemeStore";

import { Text } from "@/components/core";
import { adjustLightness } from "@/utils/colorGenerator";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const HomeworkDateItem = memo(
    ({ contracted, isEvaluation, isActive, allTasksCompleted, onPress }) => {
        const { colors } = useTheme();
        const progress = useSharedValue(isActive ? 1 : 0);

        useEffect(() => {
            progress.value = withSpring(isActive ? 1 : 0, {
                damping: 15,
                stiffness: 150,
                mass: 0.8,
            });
        }, [isActive]);

        const animatedStyle = useAnimatedStyle(() => {
            return {
                height: 65 + 25 * progress.value,
                transform: [{ translateY: 25 * (1 - progress.value) }],
            };
        });

        return (
            <View style={{ width: 65, height: 90, marginBottom: 24 }}>
                <AnimatedTouchableOpacity
                    style={[
                        {
                            width: 65,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.surface.card,
                            borderRadius: 16,
                            borderWidth: allTasksCompleted ? 1.5 : 0,
                            borderColor: "#129e43",
                        },
                        animatedStyle,
                    ]}
                    onPress={onPress}
                    activeOpacity={0.7}
                >
                    <Text
                        style={{
                            fontSize: 20,
                            fontFamily: "SemiBold",
                            color: isEvaluation ? "#ff4b4b" : colors.text.primary,
                        }}
                    >
                        {contracted[1]}
                    </Text>
                    <Text
                        style={{
                            fontSize: 20,
                            fontFamily: "SemiBold",
                            color: isEvaluation ? "#ff4b4b" : colors.text.primary,
                            marginTop: -12,
                        }}
                    >
                        {contracted[0]}
                    </Text>
                </AnimatedTouchableOpacity>
            </View>
        );
    }
);

export default function HomeworkDatesRow({
    homeworksDates,
    dates,
    activeDate,
    onSelectDate,
    setActiveDate,
    mergedHomeworks,
    style,
}) {
    const datesData = dates ?? homeworksDates;
    const handleSelect = onSelectDate ?? setActiveDate;

    if (!datesData || Object.keys(datesData).length === 0) return null;

    return (
        <View style={[{ paddingHorizontal: 9 }, style]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 12,
                    paddingHorizontal: 6,
                    paddingTop: 8,
                }}
            >
                {Object.entries(datesData).map(([date, meta]) => {
                    const { contracted = ["", ""], isEvaluation } = meta || {};
                    const tasks = mergedHomeworks
                        ? (mergedHomeworks[date] ?? [])
                        : [];
                    const allTasksCompleted =
                        tasks.length > 0 &&
                        tasks.every(({ isDone }) => isDone === "done");

                    return (
                        <HomeworkDateItem
                            key={date}
                            contracted={contracted}
                            isEvaluation={isEvaluation}
                            isActive={date === activeDate}
                            allTasksCompleted={allTasksCompleted}
                            onPress={() => handleSelect?.(date)}
                        />
                    );
                })}
            </ScrollView>
        </View>
    );
}

