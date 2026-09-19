import { useTheme } from "@/hooks/useThemeStore";
import { Text } from "../core";
import { UiStyles } from "./UiStyles";

export default function Title({ children, ...props }) {
    const theme = useTheme();
    return (
        <Text
            style={UiStyles.title}
            color={theme.colors.accent}
            preset="h3"
            {...props}
        >
            {children}
        </Text>
    );
}

