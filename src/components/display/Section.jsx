import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import dynamicBorderRadius from "@/utils/borderRadius";
import { Pressable, View } from "react-native";
import { Text } from "../core";

export default function Section({
    disabled = false,
    onPress,
    index = 0,
    totalLength = 0,
    radiusExt = 12,
    backgroundColor,
    radiusInt = 5,
    label,
    subtitle,
    icon,
    height = 54,
    children,
}) {
    const { colors } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => ({
                backgroundColor:
                    backgroundColor ?? withAlpha(colors.surface.simpleOpacity, 0.1),
                height,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: pressed ? 0.6 : 1,
                ...dynamicBorderRadius(index, totalLength, radiusInt, radiusExt),
            })}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                {icon}
                <View>
                    <Text preset="title2">{label}</Text>
                    {subtitle ? (
                        <Text
                            preset="label2"
                            color={withAlpha(colors.text.primary, 0.5)}
                        >
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>
            {children}
        </Pressable>
    );
}

