import { Linking } from "react-native";
import { Text } from "../core";

export default function LinkText({
    href,
    color,
    underline = false,
    preset = "control.md",
    children,
    ...props
}) {
    const openURL = () => {
        Linking.openURL(href).catch((err) =>
            console.error("Erreur lors de l'ouverture du lien :", err)
        );
    };

    return (
        <Text
            color={color}
            onPress={openURL}
            preset={preset}
            decoration={underline ? "underline" : undefined}
            {...props}
        >
            {children}
        </Text>
    );
}

