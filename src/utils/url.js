import { navigateFromUrl } from "@/router/rootNavigation";
import { Linking } from "react-native";

export const isInternalUrl = (href) => {
    if (!href) return false;
    return (
        href.startsWith("kolybri://") ||
        href.startsWith("kolybri-dev://") ||
        href.startsWith("kolybri-preview://") ||
        href.startsWith("app://")
    );
};

export const openUrl = (href) => {
    if (!href) return;

    if (isInternalUrl(href)) {
        const handled = navigateFromUrl(href);
        if (handled) return;
    }

    Linking.openURL(href).catch((err) =>
        console.error("Erreur lors de l'ouverture du lien :", err)
    );
};
