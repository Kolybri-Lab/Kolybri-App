import { SimpleArrow } from "@/components/svg";
import { useTheme } from "@/hooks/useThemeStore";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Text } from "../core";

export default function DropDown({
    options = [
        { label: "Trimestre 1", value: "A001" },
        { label: "Trimestre 2", value: "A002" },
        { label: "Trimestre 3", value: "A003" },
    ],
    onSelect = () => {},
}) {
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);
    const { colors } = useTheme();
    const progress = useSharedValue(0);

    const toggleDropdown = () => {
        const next = !open;
        setOpen(next);
        progress.value = withTiming(next ? 1 : 0, { duration: 200 });
    };

    const handleSelect = (item) => {
        setSelected(item);
        setOpen(false);
        progress.value = withTiming(0, { duration: 200 });
        onSelect(item.value);
    };

    const dropdownStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        height: Math.min(
            interpolate(progress.value, [0, 1], [0, options.length * 50]),
            150
        ),
        borderRadius: interpolate(progress.value, [0, 1], [0, 20]),
    }));

    const arrowStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
        ],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        borderBottomLeftRadius: interpolate(progress.value, [0, 1], [20, 0]),
        borderBottomRightRadius: interpolate(progress.value, [0, 1], [20, 0]),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderColor: "hsla(240, 14%, 18%, .98)",

        borderTopWidth: interpolate(progress.value, [0, 1], [0, 1.6]),
        borderLeftWidth: interpolate(progress.value, [0, 1], [0, 1.6]),
        borderRightWidth: interpolate(progress.value, [0, 1], [0, 1.6]),
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.button, buttonAnimatedStyle]}>
                <TouchableOpacity onPress={toggleDropdown} activeOpacity={0.8}>
                    <View style={styles.buttonContent}>
                        <Animated.View style={arrowStyle}>
                            <SimpleArrow fill={colors.text.primary} />
                        </Animated.View>

                        <Text style={styles.buttonText}>
                            {selected ? selected.label : options[0].label}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.dropdown, dropdownStyle]}>
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleSelect(item)}
                        >
                            <Text style={styles.optionText} oneLine>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: "58%", maxHeight: 170, alignItems: "center" },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        backgroundColor: "hsla(0, 0%, 0%, .3)",
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: { marginLeft: 8 },
    dropdown: {
        overflow: "hidden",
        width: "100%",
        backgroundColor: "hsla(240, 14%, 18%, .98)",
        paddingVertical: 10,
    },
    option: {
        alignItems: "center",
        marginVertical: 4,
        borderRadius: 5,
        marginHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: "hsl(240, 25%, 30%)",
    },
    optionText: { flexShrink: 1 },
});

