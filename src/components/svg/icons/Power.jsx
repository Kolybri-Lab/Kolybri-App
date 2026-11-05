import Svg, { Path } from "react-native-svg";

export default function PowerIcon({ size = 30, fill = "white", ...props }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 16 16" fill={fill} {...props}>
            <Path d="M8 0a1 1 0 00-1 1v6a1 1 0 002 0V1a1 1 0 00-1-1z"></Path>
            <Path d="M12.665 2.781a1 1 0 10-1.333 1.491 5 5 0 11-6.665.001 1 1 0 00-1.333-1.49 7 7 0 109.331-.002z"></Path>
        </Svg>
    );
}
