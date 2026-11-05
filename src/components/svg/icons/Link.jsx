import Svg, { Path } from "react-native-svg";

export default function LinkIcon({ size = 30, fill = "white", ...props }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            stroke={fill}
            fill={"transparent"}
            transform={[{ rotate: "320deg" }]}
            {...props}
        >
            <Path
                d="M10 16H7C4.79086 16 3 14.2091 3 12V12C3 9.79086 4.79086 8 7 8H10"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            ></Path>
            <Path
                d="M16 12H8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            ></Path>
            <Path
                d="M14 16H17C19.2091 16 21 14.2091 21 12V12C21 9.79086 19.2091 8 17 8H14"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            ></Path>
        </Svg>
    );
}
