import { ViewStyle } from "react-native";

export default function dynamicBorderRadius(
    index: number,
    totalLength: number,
    int: number,
    ext: number
): Pick<
    ViewStyle,
    | "borderTopLeftRadius"
    | "borderTopRightRadius"
    | "borderBottomLeftRadius"
    | "borderBottomRightRadius"
> {
    if (index === 0 && totalLength > 1) {
        return {
            borderTopLeftRadius: ext,
            borderTopRightRadius: ext,
            borderBottomLeftRadius: int,
            borderBottomRightRadius: int,
        };
    } else if (index === totalLength - 1 && totalLength > 1) {
        return {
            borderTopLeftRadius: int,
            borderTopRightRadius: int,
            borderBottomLeftRadius: ext,
            borderBottomRightRadius: ext,
        };
    } else if (totalLength === 1) {
        return {
            borderTopLeftRadius: ext,
            borderTopRightRadius: ext,
            borderBottomLeftRadius: ext,
            borderBottomRightRadius: ext,
        };
    } else {
        return {
            borderTopLeftRadius: int,
            borderTopRightRadius: int,
            borderBottomLeftRadius: int,
            borderBottomRightRadius: int,
        };
    }
}
