import * as FileSystem from "expo-file-system/legacy";

export async function cacheProfilePhoto(
    userId: number,
    remoteUrl: string,
    token: string
): Promise<string | null> {
    if (!remoteUrl) return null;

    const formattedUrl = remoteUrl.startsWith("//")
        ? `https:${remoteUrl}`
        : remoteUrl;

    const localUri = `${FileSystem.cacheDirectory}user_${userId}.jpg`;

    try {
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
            if (fileInfo.size < 1000) {
                await FileSystem.deleteAsync(localUri, { idempotent: true });
            } else {
                return localUri;
            }
        }

        const downloadResult = await FileSystem.downloadAsync(
            formattedUrl,
            localUri,
            {
                headers: {
                    "X-Token": token,
                    Referer: "https://www.ecoledirecte.com/",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            }
        );

        if (downloadResult.status !== 200) {
            await FileSystem.deleteAsync(localUri, { idempotent: true });
            return null;
        }

        return downloadResult.uri;
    } catch (error) {
        console.error("Cache Profile Photo Error:", error);
        return null;
    }
}

