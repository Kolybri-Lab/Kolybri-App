import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/hooks/useThemeStore";

export default function RoadFinish({ size = 30, fill, props = {} }) {
    const theme = useTheme();
    fill = fill || theme.colors.text.primary
    return (
        <Svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
            <Path
                d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3L4 22"
                stroke={fill}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
}

