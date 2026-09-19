import { useTheme } from "@/hooks/useThemeStore";
import Svg, { LinearGradient, Path, Stop } from "react-native-svg";

export default function EDPLogo({ size = 30, fill = "white", props = {} }) {
    const theme = useTheme();
    return (
        <Svg
            viewBox="0 0 91 86"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            width={size}
            height={size}
        >
            <Path
                fill="url(#gradient-)"
                class="paths"
                d="M89.9985 24V0H31.9985C21.3319 0.833333 0 7.3 0 38.5C5.50049 26.5 17.499 24 21.4985 24H89.9985Z"
            ></Path>
            <Path
                fill="url(#gradient-)"
                class="paths"
                d="M90.0017 55V31.5H27.0016C-9.00047 31.5 -9.00055 86 27.0016 86H90.0017V62.5H27.0016C22.0011 62.5 22.0013 55 27.0016 55H90.0017Z"
            ></Path>
            <LinearGradient id="gradient-">
                <Stop
                    class="start"
                    offset="0%"
                    stopColor={theme.colors.logo.from}
                ></Stop>
                <Stop
                    class="end"
                    offset="100%"
                    stopColor={theme.colors.logo.to}
                ></Stop>
            </LinearGradient>
        </Svg>
    );
}

