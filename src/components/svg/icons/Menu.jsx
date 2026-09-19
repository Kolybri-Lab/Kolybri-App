import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/hooks/useThemeStore";

export default function MenuIcon({ size = 30, fill, ...props }) {
    const theme = useTheme();
    fill = fill || theme.colors.text.primary;

    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={"none"} {...props}>
            <Path
                d="M4 17H8M12 17H20M4 12H20M4 7H12M16 7H20"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

