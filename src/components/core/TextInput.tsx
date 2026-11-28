import { useTheme } from "@/hooks/useThemeStore";
import { resolveFontFamily } from "@/themes/tokens";
import { forwardRef, useMemo } from "react";
import {
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    TextStyle,
} from "react-native";

export type TextInputProps = RNTextInputProps;

const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
    { style, placeholderTextColor, ...props },
    ref,
) {
    const { colors } = useTheme();

    const baseStyle = useMemo<TextStyle>(
        () => ({
            fontFamily: resolveFontFamily("baloo", "medium"),
            fontSize: 16,
            color: colors.text.primary,
            includeFontPadding: false,
        }),
        [colors.text.primary],
    );

    return (
        <RNTextInput
            ref={ref}
            placeholderTextColor={placeholderTextColor ?? colors.text.secondary}
            {...props}
            style={style ? [baseStyle, style] : baseStyle}
        />
    );
});

export default TextInput;
