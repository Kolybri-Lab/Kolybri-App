import Svg, { Path } from "react-native-svg";

export default function Search({ size = 30, fill = "white", props = {} }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill={fill} {...props}>
            <Path d="M30.9,28.1a14.8,14.8,0,0,0,3-10.9A15.2,15.2,0,0,0,20.1,4a15,15,0,0,0-3,29.9,15.3,15.3,0,0,0,11-2.9L40.6,43.4a1.9,1.9,0,0,0,2.8,0h0a1.9,1.9,0,0,0,0-2.8ZM20.8,29.9A11,11,0,0,1,8.2,17.1a10.8,10.8,0,0,1,8.9-8.9A10.9,10.9,0,0,1,29.8,20.9,11.1,11.1,0,0,1,20.8,29.9Z"></Path>
        </Svg>
    );
}
