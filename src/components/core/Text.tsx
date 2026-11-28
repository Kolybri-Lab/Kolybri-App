import { useTheme } from "@/hooks/useThemeStore";
import {
    FontFamily,
    FontWeight,
    TypographyPreset,
    resolveFontFamily,
    typography,
} from "@/themes/tokens";
import { useMemo } from "react";
import {
    Text as RNText,
    StyleProp,
    StyleSheet,
    TextProps as RNTextProps,
    TextStyle,
} from "react-native";

const BALOO_MIN_LINE_HEIGHT_RATIO = 1.248;
const LUCIOLE_MIN_LINE_HEIGHT_RATIO = 1.35;

export interface TextProps extends Omit<RNTextProps, "style"> {
    preset?: TypographyPreset;
    family?: FontFamily;
    weight?: FontWeight;
    size?: number;
    color?: string;
    align?: TextStyle["textAlign"];
    decoration?: TextStyle["textDecorationLine"];
    oneLine?: boolean;
    style?: StyleProp<TextStyle>;
}

export default function Text({
    preset = "body.md",
    family = "baloo",
    weight,
    size,
    color: colorProp,
    align,
    decoration,
    oneLine,
    style: styleProp,
    children,
    ...props
}: TextProps) {
    const { colors } = useTheme();

    const computedStyle = useMemo<StyleProp<TextStyle>>(() => {
        const presetDef = typography[preset] ?? typography["body.md"];
        const flattenedStyle = styleProp ? StyleSheet.flatten(styleProp) : undefined;
        const effectiveWeight = weight ?? presetDef.weight;
        const resolvedFontFamily = resolveFontFamily(family, effectiveWeight);
        const defaultColor = colors.text[presetDef.defaultColor] ?? colors.text.primary;

        const effectiveSize = size ?? flattenedStyle?.fontSize ?? presetDef.fontSize;
        const baseRatio = presetDef.lineHeight / presetDef.fontSize;

        let computedLineHeight: number | undefined = presetDef.lineHeight;
        const hasExplicitLineHeight = flattenedStyle?.lineHeight !== undefined;
        if (!hasExplicitLineHeight) {
            if (family === "luciole") {
                computedLineHeight = Math.max(
                    Math.round(effectiveSize * baseRatio),
                    Math.ceil(effectiveSize * LUCIOLE_MIN_LINE_HEIGHT_RATIO),
                );
            } else if (effectiveSize !== presetDef.fontSize) {
                computedLineHeight = Math.max(
                    Math.round(effectiveSize * baseRatio),
                    Math.ceil(effectiveSize * BALOO_MIN_LINE_HEIGHT_RATIO),
                );
            }
        }

        const baseStyle: TextStyle = {
            fontFamily: resolvedFontFamily,
            fontSize: presetDef.fontSize,
            lineHeight: computedLineHeight,
            color: defaultColor,
            includeFontPadding: false,
        };

        const overrideStyle: TextStyle = {
            includeFontPadding: false,
            ...(!hasExplicitLineHeight && { lineHeight: computedLineHeight }),
            ...(colorProp !== undefined && { color: colorProp }),
            ...(size !== undefined && { fontSize: size }),
            ...((weight !== undefined || family !== "baloo") && {
                fontFamily: resolvedFontFamily,
            }),
            ...(align !== undefined && { textAlign: align }),
            ...(decoration !== undefined && { textDecorationLine: decoration }),
        };

        return styleProp ? [baseStyle, styleProp, overrideStyle] : [baseStyle, overrideStyle];
    }, [
        preset,
        family,
        weight,
        size,
        colorProp,
        align,
        decoration,
        styleProp,
        colors.text,
    ]);

    return (
        <RNText
            {...props}
            style={computedStyle}
            numberOfLines={oneLine ? 1 : props.numberOfLines}
            ellipsizeMode={oneLine ? "tail" : props.ellipsizeMode}
        >
            {children}
        </RNText>
    );
}
