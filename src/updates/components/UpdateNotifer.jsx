import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";

export function UpdateNotifier() {
    const { isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
        if (isUpdatePending) {
            Alert.alert(
                "Mise à jour disponible",
                "Une nouvelle version de l'app a été téléchargée. Redémarrer maintenant pour l'appliquer ?",
                [
                    { text: "Plus tard", style: "cancel" },
                    { text: "Redémarrer", onPress: () => Updates.reloadAsync() },
                ]
            );
        }
    }, [isUpdatePending]);

    return null;
}
