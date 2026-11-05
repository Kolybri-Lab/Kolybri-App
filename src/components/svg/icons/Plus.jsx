import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/hooks/useThemeStore";

export default function PlusIcon({ size = 30, fill, props = {} }) {
    const theme = useTheme();
    fill = fill || theme.colors.text.primary;

    return (
        <Svg fill={fill} width={size} height={size} viewBox="0 0 24 24" {...props}>
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7C13 6.44771 12.5523 6 12 6C11.4477 6 11 6.44771 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17Z"
            />
        </Svg>
    );
}
