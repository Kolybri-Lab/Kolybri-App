import { Check } from "@/components/svg";
import { useTheme } from "@/hooks/useThemeStore";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../core";

export default function CheckBox({
    initialValue = false,
    onValueChange,
    libelle = "",
}) {
    const [isChecked, setIsChecked] = useState(initialValue);
    const { colors } = useTheme();
    const toggleCheckbox = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={toggleCheckbox}>
                <View
                    style={[styles.checkbox, { borderColor: colors.brand.primary }]}
                >
                    {isChecked && (
                        <Text>
                            <Check fill={colors.text.primary} />
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
            <Text style={styles.text} color={colors.brand.primary} preset="body2">
                {libelle}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 6,
    },
    text: {
        marginLeft: 16,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
});

