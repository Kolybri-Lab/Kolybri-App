import { MorphingText, Text } from "@/components/core";
import { useTheme } from "@/hooks/useThemeStore";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { ChevronDown } from "lucide-react-native";
import { memo, useCallback, useState } from "react";
import { DimensionValue, Pressable, StyleProp, View, ViewStyle } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

export type SelectorType = "dateselector" | "dropdown" | "research";

export interface SelectorProps {
    type?: SelectorType;
    text?: string;
    value?: any;
    selectedValue?: any;
    date?: any; // string | Date | { date: string; fullDate?: string }
    options?: Array<any>;
    onSelect?: (value: any) => void;
    onPress?: () => void;
    placeholder?: string;
    disabled?: boolean;
    minWidth?: DimensionValue;
    selectorPosition?: "left" | "right" | "center";
    position?: "left" | "right";
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
}

const getItemId = (item: any) => item?.id ?? item?.value ?? item;
const getItemName = (item: any) =>
    item?.name ??
    item?.label ??
    (item !== undefined && item !== null ? String(item) : "");

function Selector({
    type = "dateselector",
    text,
    value,
    selectedValue,
    date,
    options = [],
    onSelect,
    onPress,
    placeholder = "Sélectionner...",
    disabled = false,
    minWidth,
    selectorPosition = "left",
    position,
    fontSize = 20,
    style,
}: SelectorProps) {
    const { colors } = useTheme();
    const [isDeployed, setIsDeployed] = useState(false);

    const transitionProgress = useSharedValue(0);
    const opacityProgress = useSharedValue(0);

    const activeValue = value !== undefined ? value : selectedValue;
    const isRight = selectorPosition === "right" || position === "right";

    const displayedText =
        text ??
        (type === "dropdown"
            ? getItemName(
                  options.find((opt) => getItemId(opt) === getItemId(activeValue)) ??
                      activeValue
              ) || placeholder
            : (date?.fullDate ??
              (typeof date === "string" ? date : (date?.date ?? placeholder))));

    const openDatePicker = useCallback(() => {
        const pickerDate = date?.date
            ? dayjs(date.date).toDate()
            : date
              ? dayjs(date).toDate()
              : new Date();

        DateTimePickerAndroid.open({
            value: pickerDate,
            mode: "date",
            onValueChange: (_, selected) => {
                if (selected) {
                    const iso = dayjs(selected).format("YYYY-MM-DD");
                    onSelect?.(iso);
                }
            },
        });
    }, [date, onSelect]);

    const closeDropdown = useCallback(() => {
        setIsDeployed(false);
        transitionProgress.value = withSpring(0, {
            damping: 25,
            stiffness: 300,
        });
        opacityProgress.value = withTiming(0, { duration: 150 });
    }, [transitionProgress, opacityProgress]);

    const toggleDropdown = useCallback(() => {
        const next = !isDeployed;
        setIsDeployed(next);
        transitionProgress.value = withSpring(next ? 1 : 0, {
            damping: 25,
            stiffness: 300,
        });
        opacityProgress.value = withTiming(next ? 1 : 0, { duration: 180 });
    }, [isDeployed, transitionProgress, opacityProgress]);

    const handleSelectOption = useCallback(
        (item: any) => {
            closeDropdown();
            onSelect?.(item);
        },
        [closeDropdown, onSelect]
    );

    const handlePress = useCallback(() => {
        if (disabled) return;

        if (type === "dateselector") {
            openDatePicker();
        } else if (type === "dropdown") {
            toggleDropdown();
        } else if (type === "research") {
            onPress?.();
        }
    }, [disabled, type, openDatePicker, toggleDropdown, onPress]);

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: `${interpolate(
                    transitionProgress.value,
                    [0, 1],
                    [0, 180]
                )}deg`,
            },
        ],
    }));

    const dropDownStyle = useAnimatedStyle(() => ({
        opacity: opacityProgress.value,
        transform: [
            {
                translateY: interpolate(transitionProgress.value, [0, 1], [-6, 0]),
            },
            {
                scale: interpolate(transitionProgress.value, [0, 1], [0.96, 1]),
            },
        ] as [{ translateY: number }, { scale: number }],
    }));

    return (
        <View
            style={[
                {
                    gap: 4,
                    flexShrink: 1,
                    minWidth: 0,
                    position: "relative",
                    zIndex: isDeployed ? 10 : 1,
                },
                style,
            ]}
        >
            <Pressable
                onPress={handlePress}
                disabled={disabled}
                style={({ pressed }) => ({
                    backgroundColor: colors.surface.default,
                    paddingHorizontal: 20,
                    paddingVertical: 4,
                    borderRadius: 50,
                    flexShrink: 1,
                    minWidth: 0,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    opacity: pressed ? 0.7 : 1,
                })}
            >
                <MorphingText
                    style={{ fontFamily: "SemiBold", fontSize }}
                    duration={250}
                    translateDistance={4}
                    value={displayedText}
                />

                {type === "dropdown" && (
                    <Animated.View style={chevronStyle}>
                        <ChevronDown size={18} color={colors.text.primary} />
                    </Animated.View>
                )}
            </Pressable>

            {type === "dropdown" && options.length > 0 && isDeployed && (
                <Pressable
                    onPress={closeDropdown}
                    style={{
                        position: "absolute",
                        top: -10000,
                        left: -10000,
                        right: -10000,
                        bottom: -10000,
                        zIndex: 99,
                    }}
                />
            )}

            {type === "dropdown" && options.length > 0 && (
                <Animated.View
                    pointerEvents={isDeployed ? "auto" : "none"}
                    style={[
                        {
                            position: "absolute",
                            top: "100%",
                            ...(isRight ? { right: 0 } : { left: 0 }),
                            minWidth: minWidth ?? "100%",
                            marginTop: 8,
                            zIndex: 100,
                        },
                        dropDownStyle,
                    ]}
                >
                    <View
                        style={{
                            backgroundColor: colors.surface.default,
                            borderRadius: 16,
                            overflow: "hidden",
                            //borderWidth: 1,
                            //borderColor: colors.border.subtle,
                            //elevation: 4,
                            //shadowColor: "#000",
                            //shadowOffset: { width: 0, height: 4 },
                            //shadowOpacity: 0.12,
                            //shadowRadius: 8,
                        }}
                    >
                        {options.map((option, index) => {
                            const optId = getItemId(option) ?? index;
                            const optName = getItemName(option);
                            const isSelected = getItemId(activeValue) === optId;

                            return (
                                <Pressable
                                    key={`opt-${optId}-${index}`}
                                    onPress={() => handleSelectOption(option)}
                                    style={({ pressed }) => ({
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        backgroundColor: isSelected
                                            ? colors.surface.raised
                                            : pressed
                                              ? colors.surface.muted
                                              : "transparent",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    })}
                                >
                                    <Text
                                        style={{
                                            fontFamily: isSelected
                                                ? "SemiBold"
                                                : "Medium",
                                            fontSize: 16,
                                            color: isSelected
                                                ? colors.text.accent
                                                : colors.text.primary,
                                        }}
                                    >
                                        {optName}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

export default memo(Selector);

