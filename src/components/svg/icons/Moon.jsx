import Svg, { Path } from "react-native-svg";

export default function Moon({ size = 30, fill = "white", props = {} }) {
    return (
        <Svg width={size} height={size} viewBox="4 4 16 16" {...props}>
            <Path
                d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.171 19 18.1395 17.1814 19 14.2899"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={"transparent"}
                stroke={fill}
            ></Path>
            <Path
                d="M19 14C18.8319 14 18.6652 13.9941 18.5 13.9824C12.5 15 9.50001 11.5 12 5"
                strokeWidth="2"
                strokeLinecap="round"
                fill={"transparent"}
                strokeLinejoin="round"
                stroke={fill}
            ></Path>
        </Svg>
    );
}
