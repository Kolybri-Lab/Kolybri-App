import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { DocumentActionResult } from "../../types/types";

export const downloadCustomData = async (
    data: unknown,
    fileName: string
): Promise<DocumentActionResult | undefined> => {
    try {
        if (
            !data ||
            (Array.isArray(data) && data.length === 0) ||
            (typeof data === "object" && Object.keys(data).length === 0)
        ) {
            Alert.alert("Aucune donnée", "Il n'y a rien à exporter pour le moment.");
            return { sucess: false, message: "Aucune donnée à exporter" };
        }

        const jsonString = JSON.stringify(data, null, 2);
        const fullFileName = fileName.endsWith(".json")
            ? fileName
            : `${fileName}.json`;

        const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                "content://com.android.externalstorage.documents/tree/primary%3ADownload"
            );

        if (!permissions.granted) {
            Alert.alert("Permission refusée");
            return { sucess: false, message: "Permission refusée" };
        }

        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fullFileName,
            "application/json"
        );

        await FileSystem.StorageAccessFramework.writeAsStringAsync(
            destUri,
            jsonString,
            { encoding: "utf8" }
        );

        return { sucess: true, message: "" };
    } catch (error) {
        console.error("Erreur lors de l'export :", error);
        Alert.alert("Erreur", "Impossible d'exporter les données.");
        return { sucess: false, message: error };
    }
};
