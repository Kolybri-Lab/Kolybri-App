import { useTheme } from "@/hooks/useThemeStore";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Text } from "../core";
import { Chevron } from "../svg";

/* options: [{ id, name }, ...] or [{ value, label }, ...] */
/* selectorPosition: "left" | "right" | "center" (default: "left") */

const POSITIONS = {
    left: "flex-start",
    right: "flex-end",
    center: "center",
};

const getItemId = (item) => item?.id ?? item?.value ?? item;
const getItemName = (item) =>
    item?.name ??
    item?.label ??
    (item !== undefined && item !== null ? String(item) : undefined);

export default function DropDownMenu({
    options = [],
    placeholder = "Select...",
    value,
    onSelect,
    disabled = false,
    minWidth = "auto",
    selectorPosition = "left",
    customButtonStyle = {},
    customDropDownStyle = {},
}) {
    const [isDeployed, setIsDeployed] = useState(false);
    const [internalSelected, setInternalSelected] = useState(value);
    const { colors } = useTheme();
    const transitionProgress = useSharedValue(0);
    const opacityProgress = useSharedValue(0);
    const pressScale = useSharedValue(1);

    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalSelected;

    const toggleDeployed = useCallback(() => {
        if (disabled) return;

        const next = !isDeployed;

        setIsDeployed(next);

        transitionProgress.value = withSpring(next ? 1 : 0, {
            damping: 47,
            stiffness: 600,
        });

        opacityProgress.value = withTiming(next ? 1 : 0, {
            duration: 250,
        });
    }, [disabled, isDeployed]);

    const closeDropdown = useCallback(() => {
        setIsDeployed(false);

        transitionProgress.value = withSpring(0, {
            damping: 47,
            stiffness: 600,
        });

        opacityProgress.value = withTiming(0, {
            duration: 250,
        });
    }, []);

    const handleSelected = useCallback(
        (item) => {
            closeDropdown();

            if (!isControlled) {
                setInternalSelected(item);
            }

            onSelect?.(item);
        },
        [closeDropdown, isControlled, onSelect]
    );

    const dropDownStyle = useAnimatedStyle(() => ({
        opacity: opacityProgress.value,
        transform: [
            {
                translateY: interpolate(transitionProgress.value, [0, 1], [-8, 0]),
            },
            {
                scale: interpolate(transitionProgress.value, [0, 1], [0.98, 1]),
            },
        ],
    }));

    const buttonSyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate:
                    interpolate(transitionProgress.value, [0, 1], [90, 270]) + "deg",
            },
        ],
    }));

    const selectedName = getItemName(selected);
    const alignment = POSITIONS[selectorPosition] || "flex-start";

    return (
        <View style={{ width: "100%", alignItems: alignment }}>
            <Animated.View style={[buttonSyle, { alignSelf: alignment }]}>
                <Pressable
                    onPress={toggleDeployed}
                    disabled={disabled}
                    onPressIn={() => {
                        pressScale.value = withSpring(0.94, {
                            damping: 10,
                            stiffness: 140,
                            mass: 0.7,
                        });
                    }}
                    onPressOut={() => {
                        pressScale.value = withSpring(1, {
                            damping: 12,
                            stiffness: 170,
                            mass: 1.1,
                        });
                    }}
                    style={[
                        {
                            backgroundColor: colors.surface.card,
                            paddingHorizontal: 18,
                            paddingVertical: 10,
                            borderRadius: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            alignSelf: alignment,
                        },
                        customButtonStyle,
                    ]}
                >
                    <Text preset="label1" oneLine>
                        {selectedName ?? placeholder}
                    </Text>
                    <Animated.View style={chevronStyle}>
                        <Chevron size={13} fill={colors.text.primary} />
                    </Animated.View>
                </Pressable>
            </Animated.View>

            {options.length > 0 && (
                <Animated.View
                    pointerEvents={isDeployed ? "auto" : "none"}
                    style={[
                        {
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            marginTop: 6,
                            flexDirection: "row",
                            justifyContent: alignment,
                            zIndex: 2,
                        },
                        dropDownStyle,
                    ]}
                >
                    <View
                        style={[
                            {
                                backgroundColor: colors.surface.raised,
                                borderRadius: 15,
                                overflow: "hidden",
                            },
                            customDropDownStyle,
                        ]}
                    >
                        {options.map((item, index) => {
                            const itemId = getItemId(item) ?? index;
                            const itemName = getItemName(item);
                            const isSelected = getItemId(selected) === itemId;

                            return (
                                <Pressable
                                    onPress={() => handleSelected(item)}
                                    key={`opt-${itemId}-${index}`}
                                    style={{
                                        backgroundColor: isSelected
                                            ? "hsla(0, 0%, 100%, 0.4)"
                                            : "hsla(0, 0%, 100%, 0.12)",
                                        padding: 12,
                                        minWidth,
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        flexDirection: "row",
                                    }}
                                >
                                    <Text preset="label2">{itemName}</Text>

                                    {isSelected && (
                                        <View
                                            style={{
                                                width: 7,
                                                height: 7,
                                                backgroundColor:
                                                    "hsla(0, 0%, 100%, 1)",
                                                borderRadius: 5,
                                            }}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

