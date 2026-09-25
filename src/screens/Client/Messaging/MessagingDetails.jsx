import { GoBackHeader, ScreenStack, Text } from "@/components";
import { File as FileIcon } from "@/components/svg";
import { useMessageContent } from "@/features/messaging/hooks/useMessaging";
import { downloadDocument, openDocument } from "@/helpers/documents/documentsHelper";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { formatDate } from "@/utils/date";
import { memo, useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import RenderHTML from "react-native-render-html";

const RECOVERY_MODE_BY_TYPE = {
    received: "recipient",
    sent: "sender",
    draft: null, // TODO: handle drafts
    archived: null, // TODO: handle achived messages
};

const File = memo(({ item, progress, colors, onOpen, onDownload }) => {
    const { colors: themeColors } = useTheme();
    const { id, libelle, type, taille: size } = item;
    const ext = libelle.slice(libelle.lastIndexOf(".") + 1).toLowerCase();

    return (
        <TouchableOpacity
            style={{
                overflow: "hidden",
                borderRadius: 9,
                marginBottom: 4,
            }}
            onPress={() => onOpen(item)}
            onLongPress={() => onDownload(item)}
            disabled={progress !== null && progress !== undefined}
        >
            {progress !== null && progress !== undefined && (
                <View
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${progress}%`,
                        backgroundColor: "hsla(122, 39%, 49%, 0.40)",
                        borderRadius: 9,
                    }}
                />
            )}
            <View
                style={{
                    backgroundColor:
                        progress !== null && progress !== undefined
                            ? "transparent"
                            : themeColors.surface.raised,
                    padding: 10,
                    gap: 12,
                    borderRadius: 9,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        padding: 7,
                        backgroundColor: withAlpha(themeColors.surface.default, 0.5),
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                    }}
                >
                    <FileIcon fill={colors.text.primary} size={23} extention={ext} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text preset="label2" decoration="underline">
                        {libelle}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default function MessagingDetails({ route }) {
    const { token = "", message = {} } = route?.params || {};
    const {
        id: messageId,
        type: typeOfRecovery,
        answered,
        canAnswer,
        date,
        files,
        folder,
        read,
        recipientType,
        sender,
        subject,
        transferred,
    } = message || {};
    const recoveryMode = RECOVERY_MODE_BY_TYPE[typeOfRecovery] ?? null;

    const {
        data: messageContent,
        isLoading,
        isError,
    } = useMessageContent(token, messageId, recoveryMode);
    const { colors } = useTheme();
    const { width } = useWindowDimensions();

    const [downloadProgress, setDownloadProgress] = useState({});

    const tagsStyles = useMemo(
        () => ({
            u: { textDecorationLine: "underline" },
            i: { fontStyle: "italic" },
            a: { textDecorationLine: "underline", color: "hsl(207, 77%, 51%)" },
            strong: { fontWeight: 700 },
        }),
        []
    );

    const baseStyle = useMemo(
        () => ({
            color: colors.text.primary,
        }),
        [colors.text.primary]
    );

    const MessageHTML = useMemo(
        () => (
            <RenderHTML
                contentWidth={width}
                source={{ html: messageContent?.content ?? "" }}
                ignoredDomTags={["script", "iframe", "object", "o:p"]}
                baseStyle={baseStyle}
                tagsStyles={tagsStyles}
            />
        ),
        [messageContent?.content, baseStyle, tagsStyles, width]
    );

    const handleOpen = useCallback(
        (item) =>
            openDocument(
                { fileName: item.libelle, fileType: item.type, fileId: item.id },
                token,
                setDownloadProgress
            ),
        [token]
    );

    const handleDownload = useCallback(
        (item) =>
            downloadDocument(
                { fileName: item.libelle, fileType: item.type, fileId: item.id },
                token,
                setDownloadProgress
            ),
        [token]
    );

    if (isLoading) {
        return (
            <View
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isError || !messageContent) {
        return (
            <View style={{ padding: 16 }}>
                <Text>Une erreur est survenue lors du chargement du message.</Text>
            </View>
        );
    }

    return (
        <ScreenStack horizontalSpacing={14}>
            <GoBackHeader
                headerTitle={"Retour aux messages"}
                backArrow={{ color: colors.text.primary, size: 24 }}
                height={33}
                backgroundColor={colors.background.app}
                fallbackRoute={routesNames.client.messaging.content}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text preset="h3" style={{ marginBottom: 10, marginTop: 20 }}>
                    Sujet : {subject}
                </Text>

                <View
                    style={{
                        backgroundColor: colors.surface.default,
                        padding: 14,
                        borderRadius: 16,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 12,
                            gap: 8,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 8,
                                padding: 6,
                                borderRadius: 30,
                                flexShrink: 1,
                                minWidth: 0,
                            }}
                        >
                            <View
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 21,
                                    backgroundColor: colors.brand.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Text preset="label1" style={{ color: "white" }}>
                                    {sender.initials ?? "??"}
                                </Text>
                            </View>
                            <View>
                                <Text
                                    preset="label2"
                                    numberOfLines={1}
                                    style={{ flexShrink: 1 }}
                                >
                                    {sender.fullName}
                                </Text>
                                <Text
                                    preset="label2"
                                    numberOfLines={1}
                                    style={{ flexShrink: 0 }}
                                >
                                    {formatDate(new Date(date), "full")}
                                </Text>
                            </View>
                        </View>
                        <Text>{read ? "Lu" : "Non lu"}</Text>
                    </View>

                    <View
                        style={{
                            height: 1.5,
                            borderRadius: 4,
                            backgroundColor: colors.border.subtle,
                            marginTop: 14,
                            marginBottom: 24,
                        }}
                    />

                    {MessageHTML}

                    {files?.length > 0 && (
                        <View style={{ marginTop: 16, gap: 8 }}>
                            {files.map((item) => (
                                <File
                                    key={item.id}
                                    item={item}
                                    progress={downloadProgress[item.id] ?? null}
                                    colors={colors}
                                    onOpen={handleOpen}
                                    onDownload={handleDownload}
                                />
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ height: 25 }} />
            </ScrollView>
        </ScreenStack>
    );
}

