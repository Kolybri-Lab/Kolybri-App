import Svg, { Path } from "react-native-svg";

export default function Lightning({ size = 30, fill = "white", ...props }) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            stroke={fill}
            fill={"transparent"}
            {...props}
        >
            <Path
                d="M6 12L8 3H15.5L14 8.99991H18L9 21L10.5 12H6Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            ></Path>
        </Svg>
    );
}
