import { useTheme } from "@/hooks/useThemeStore";
import { Text } from "../core";
import { UiStyles } from "./UiStyles";

export default function Subtitle({ children, ...props }) {
    const theme = useTheme();

    return (
        <Text
            style={UiStyles.subtitle}
            color={theme.colors.text.brand}
            preset="title2"
            oneLine
            {...props}
        >
            {children}
        </Text>
    );
}

