import Svg, { Path, Rect } from "react-native-svg";
import { useTheme } from "@/hooks/useThemeStore";

export default function ClockIcon({ size = 30, fill, props = {} }) {
    const theme = useTheme();
    fill = fill || theme.colors.text.primary;
    return (
        <Svg fill={fill} width={size} height={size} viewBox="0 0 24 24">
            <Rect width="24" height="24" transform="rotate(180 12 12)" opacity="0" />

            <Path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />

            <Path d="M16 11h-3V8a1 1 0 0 0-2 0v4a1 1 0 0 0 1 1h4a1 1 0 0 0 0-2z" />
        </Svg>
    );
}

