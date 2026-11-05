import { Linking } from "react-native";

export const openUrl = (href) => {
    Linking.openURL(href).catch((err) =>
        console.error("Erreur lors de l'ouverture du lien :", err)
    );
};
