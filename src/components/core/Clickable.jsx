// not tested, maybe usefull

import { useTheme } from "@/hooks/useThemeStore";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

const STYLE_CACHE = new Map();
const MAX_CACHE_SIZE = 100;

const SIZE_MAP = {
    small: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 14, gap: 6 },
    medium: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16, gap: 8 },
    large: { paddingVertical: 16, paddingHorizontal: 26, fontSize: 18, gap: 10 },
};

const VARIANT_TEXT_COLOR = {
    filled: "#FFFFFF",
    outline: null,
    ghost: null,
};

const COMMON_STYLES = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
});

const cleanupCache = () => {
    if (STYLE_CACHE.size > MAX_CACHE_SIZE) {
        const entries = Array.from(STYLE_CACHE.entries());
        STYLE_CACHE.clear();
        entries.slice(-50).forEach(([key, value]) => {
            STYLE_CACHE.set(key, value);
        });
    }
};

function Button({
    variant = "filled",
    size = "medium",
    fullWidth = false,
    disabled = false,
    loading = false,
    radius = 12,
    color,
    icon,
    style,
    textStyle,
    children,
    onPress,
    ...rest
}) {
    const theme = useTheme();
    const { colors } = theme;
    const accentColor = color || colors.primary;

    const cacheKey = React.useMemo(() => {
        return [
            variant,
            size,
            fullWidth,
            disabled,
            radius,
            accentColor,
            theme.dark,
        ].join("-");
    }, [variant, size, fullWidth, disabled, radius, accentColor, theme.dark]);

    const { containerStyle, textColor } = React.useMemo(() => {
        const cached = STYLE_CACHE.get(cacheKey);
        if (cached) {
            return cached;
        }

        const sizeConfig = SIZE_MAP[size];

        const dynamicStyle = {
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            gap: sizeConfig.gap,
            borderRadius: radius,
            borderCurve: "continuous",
            width: fullWidth ? "100%" : undefined,
            opacity: disabled ? 0.4 : 1,
        };

        let computedTextColor = VARIANT_TEXT_COLOR[variant] ?? accentColor;

        if (variant === "filled") {
            Object.assign(dynamicStyle, {
                backgroundColor: accentColor,
            });
        } else if (variant === "outline") {
            Object.assign(dynamicStyle, {
                backgroundColor: "transparent",
                borderWidth: 1.5,
                borderColor: accentColor,
            });
        } else if (variant === "ghost") {
            Object.assign(dynamicStyle, {
                backgroundColor: "transparent",
            });
        }

        const finalStyle = [COMMON_STYLES.base, dynamicStyle];
        const result = { containerStyle: finalStyle, textColor: computedTextColor };

        STYLE_CACHE.set(cacheKey, result);
        cleanupCache();

        return result;
    }, [cacheKey, size, radius, fullWidth, disabled, variant, accentColor]);

    const fontSize = SIZE_MAP[size].fontSize;

    return (
        <TouchableOpacity
            {...rest}
            onPress={disabled || loading ? undefined : onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[containerStyle, style]}
        >
            {loading ? (
                <ActivityIndicator color={textColor} size="small" />
            ) : (
                <>
                    {icon}
                    {children && (
                        <Text
                            style={[
                                { color: textColor, fontSize, fontWeight: "600" },
                                textStyle,
                            ]}
                        >
                            {children}
                        </Text>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}

export default Button;

