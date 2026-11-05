import Svg, { Path } from "react-native-svg";

export default function FrenchFlag({ size = 30, ...props }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 36 36" {...props}>
            <Path fill="#ED2939" d="M36 27a4 4 0 0 1-4 4h-8V5h8a4 4 0 0 1 4 4v18z" />
            <Path fill="#002495" d="M4 5a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h8V5H4z" />
            <Path fill="#EEE" d="M12 5h12v26H12z" />
        </Svg>
    );
}
