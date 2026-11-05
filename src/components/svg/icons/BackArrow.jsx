import { useTheme } from "@/hooks/useThemeStore";
import Svg, { Path } from "react-native-svg";

export default function BackArrow({ size = 30, fill, props = {} }) {
    const theme = useTheme();

    fill = fill || theme.colors.text.primary;
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={"none"} {...props}>
            <Path
                d="M4 12H20M4 12L8 8M4 12L8 16"
                stroke={fill}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

