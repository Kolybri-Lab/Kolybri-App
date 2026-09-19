import { API } from "@/constants/api/api";
import * as FileSystem from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { fetch } from "expo/fetch";
import { Alert } from "react-native";
import { logger } from "@/utils/logger";
import {
    DocumentActionResult,
    DocumentFile,
    SetDownloadProgress,
} from "../../types/types";

const MIME_TYPES: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ppt: "application/vnd.ms-powerpoint",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    txt: "text/plain",
    zip: "application/zip",
};

const getMimeType = (fileName: string): string => {
    const ext = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
    return MIME_TYPES[ext] ?? "application/octet-stream";
};

const fetchAndConvertToBase64 = async (
    fileId: string | number,
    fileType: string,
    userAccesToken: string,
    onProgress: (progress: number) => void
): Promise<string> => {
    const url = `https://api.ecoledirecte.com/v3/telechargement.awp?verbe=get&fichierId=${fileId}&leTypeDeFichier=${fileType}&v=${API.API_VERSION}`;
    logger.log(`[FETCH] POST ${url}`);
    const response = await fetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": API.USER_AGENT,
                "X-Token": userAccesToken,
            },
            body: `data=${JSON.stringify({ forceDownload: 0 })}`,
        }
    );

    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    onProgress(40);

    const arrayBuffer = await response.arrayBuffer();
    onProgress(60);

    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    const total = uint8Array.length;

    for (let i = 0; i < total; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
        onProgress(60 + Math.round((i / total) * 30));
    }

    return btoa(binary);
};

export const openDocument = async (
    file: DocumentFile,
    userAccesToken: string,
    setDownloadProgress: SetDownloadProgress
): Promise<DocumentActionResult> => {
    const { fileName, fileType, fileId } = file;

    setDownloadProgress((prev) => ({ ...prev, [fileId]: 0 }));
    const tempUri = FileSystem.cacheDirectory + fileName;

    try {
        const fileInfo = await FileSystem.getInfoAsync(tempUri);
        if (fileInfo.exists)
            await FileSystem.deleteAsync(tempUri, { idempotent: true });

        setDownloadProgress((prev) => ({ ...prev, [fileId]: 10 }));

        const base64 = await fetchAndConvertToBase64(
            fileId,
            fileType,
            userAccesToken,
            (progress) =>
                setDownloadProgress((prev) => ({ ...prev, [fileId]: progress }))
        );

        setDownloadProgress((prev) => ({ ...prev, [fileId]: 95 }));

        await FileSystem.writeAsStringAsync(tempUri, base64, {
            encoding: "base64",
        });

        setDownloadProgress((prev) => ({ ...prev, [fileId]: 100 }));

        const contentUri = await FileSystem.getContentUriAsync(tempUri);
        const mimeType = getMimeType(fileName);

        setDownloadProgress((prev) => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });

        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
            data: contentUri,
            flags: 1,
            type: mimeType,
        });
        return { sucess: true, message: "" };
    } catch (error) {
        console.error("Erreur :", error);
        setDownloadProgress((prev) => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });
        Alert.alert("Erreur", "Impossible de télécharger le fichier.");
        return { sucess: false, message: error };
    }
};

export const downloadDocument = async (
    file: DocumentFile,
    userAccesToken: string,
    setDownloadProgress: SetDownloadProgress
): Promise<DocumentActionResult | undefined> => {
    const { fileName, fileType, fileId } = file;

    setDownloadProgress((prev) => ({ ...prev, [fileId]: 0 }));
    const tempUri = FileSystem.cacheDirectory + fileName;

    try {
        const fileInfo = await FileSystem.getInfoAsync(tempUri);
        if (fileInfo.exists)
            await FileSystem.deleteAsync(tempUri, { idempotent: true });

        setDownloadProgress((prev) => ({ ...prev, [fileId]: 10 }));

        const base64 = await fetchAndConvertToBase64(
            fileId,
            fileType,
            userAccesToken,
            (progress) =>
                setDownloadProgress((prev) => ({ ...prev, [fileId]: progress }))
        );

        setDownloadProgress((prev) => ({ ...prev, [fileId]: 95 }));

        const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                "content://com.android.externalstorage.documents/tree/primary%3ADownload"
            );

        if (!permissions.granted) {
            Alert.alert("Permission refusée");
            setDownloadProgress((prev) => {
                const next = { ...prev };
                delete next[fileId];
                return next;
            });
            return;
        }

        const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            getMimeType(fileName)
        );

        await FileSystem.StorageAccessFramework.writeAsStringAsync(destUri, base64, {
            encoding: "base64",
        });

        setDownloadProgress((prev) => ({ ...prev, [fileId]: 100 }));

        setTimeout(() => {
            setDownloadProgress((prev) => {
                const next = { ...prev };
                delete next[fileId];
                return next;
            });
        }, 1000);

        return { sucess: true, message: "" };
    } catch (error) {
        setDownloadProgress((prev) => {
            const next = { ...prev };
            delete next[fileId];
            return next;
        });
        Alert.alert("Erreur", "Impossible de télécharger le fichier.");
        return { sucess: false, message: error };
    }
};

export const assignUnit = (size: number): string => {
    console.log(size);
    const absNumber = Math.abs(size);
    if (absNumber >= 1000000) {
        return (size / 1000000).toFixed(2).replace(/\.?0+$/, "") + " Mo";
    } else if (absNumber >= 1000) {
        return (size / 1000).toFixed(2).replace(/\.?0+$/, "") + " ko";
    } else {
        return size.toString();
    }
};
