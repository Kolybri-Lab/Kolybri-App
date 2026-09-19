import { useTheme } from "@/hooks/useThemeStore";
import { View } from "react-native";
import { UiStyles } from "./UiStyles";

export default function Separation({ color }) {
    const { colors } = useTheme();
    return (
        <View style={UiStyles.separationParent}>
            <View
                style={[
                    UiStyles.separationChildren,
                    { backgroundColor: color ? color : colors.contrast },
                ]}
            />
        </View>
    );
}

