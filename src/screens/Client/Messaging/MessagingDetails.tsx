import { GoBackHeader, ScreenStack, Text } from "@/components";
import { File as FileIcon } from "@/components/svg";
import { useMessageContent } from "@/features/messaging/hooks/useMessaging";
import type { FormattedMessage, MessageAttachment } from "@/features/messaging/types";
import { downloadDocument, openDocument } from "@/helpers/documents/documentsHelper";
import { useNetworkStore } from "@/hooks/useNetworkStore";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { FONT_FAMILIES } from "@/themes/tokens";
import { formatDate } from "@/utils/date";
import { memo, type ComponentType, useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";

const systemFonts = [...defaultSystemFonts, ...Object.values(FONT_FAMILIES.baloo)];
const GoBackHeaderView = GoBackHeader as ComponentType<any>;

const RECOVERY_MODE_BY_TYPE: Record<string, "recipient" | "sender" | undefined> = {
    received: "recipient",
    sent: "sender",
    draft: undefined,
    archived: undefined,
};

interface FileProps {
    item: MessageAttachment;
    progress: number | null;
    colors: any;
    onOpen: (item: MessageAttachment) => void;
    onDownload: (item: MessageAttachment) => void;
}

const File = memo(({ item, progress, colors, onOpen, onDownload }: FileProps) => {
    const { colors: themeColors } = useTheme();
    const { libelle } = item;
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
                        backgroundColor: withAlpha(themeColors.state.success, 0.4),
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
                    <Text preset="cardTitle.sm" weight="medium" decoration="underline">
                        {libelle}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

interface MessagingDetailsProps {
    route?: {
        params?: {
            token?: string;
            message?: FormattedMessage;
        };
    };
}

export default function MessagingDetails({ route }: MessagingDetailsProps) {
    const { token = "", message } = route?.params || {};
    const {
        id: messageId,
        type: typeOfRecovery = "received",
        date = "",
        files = [],
        read = true,
        sender = {
            id: null,
            fullName: "Inconnu",
            firstName: "",
            lastName: "",
            initials: "?",
            role: null,
        },
        subject = "",
    } = message || {};
    const recoveryMode = RECOVERY_MODE_BY_TYPE[typeOfRecovery] ?? "recipient";

    const {
        data: messageContent,
        isLoading,
        isError,
    } = useMessageContent(token, messageId, recoveryMode);
    const isConnected = useNetworkStore(
        (state) => state.activeNetworkStatus.isConnected
    );
    const { colors } = useTheme();
    const { width } = useWindowDimensions();

    const [downloadProgress, setDownloadProgress] = useState<Record<string | number, number>>({});

    const tagsStyles = useMemo(
        () => ({
            u: { textDecorationLine: "underline" as const },
            i: { fontStyle: "italic" as const },
            a: { textDecorationLine: "underline" as const, color: colors.brand.primary },
            strong: { fontFamily: FONT_FAMILIES.baloo.bold, fontWeight: "normal" as const },
            b: { fontFamily: FONT_FAMILIES.baloo.bold, fontWeight: "normal" as const },
        }),
        [colors.brand.primary]
    );

    const baseStyle = useMemo(
        () => ({
            color: colors.text.primary,
            fontFamily: FONT_FAMILIES.baloo.medium,
            fontSize: 16,
            lineHeight: 22,
        }),
        [colors.text.primary]
    );

    const MessageHTML = useMemo(
        () => (
            <RenderHTML
                contentWidth={width}
                source={{ html: messageContent?.content ?? "" }}
                ignoredDomTags={["script", "iframe", "object", "o:p"]}
                systemFonts={systemFonts}
                baseStyle={baseStyle}
                tagsStyles={tagsStyles}
            />
        ),
        [messageContent?.content, baseStyle, tagsStyles, width]
    );

    const handleOpen = useCallback(
        (item: MessageAttachment) =>
            openDocument(
                { fileName: item.libelle, fileType: item.type, fileId: item.id },
                token,
                setDownloadProgress
            ),
        [token]
    );

    const handleDownload = useCallback(
        (item: MessageAttachment) =>
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
            <ScreenStack horizontalSpacing={14}>
                <GoBackHeaderView
                    headerTitle={"Retour aux messages"}
                    backArrow={{ color: colors.text.primary, size: 24 }}
                    height={33}
                    backgroundColor={colors.background.app}
                    fallbackRoute={routesNames.client.messaging.content}
                />
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <Text preset="body.lg" align="center" color={colors.text.secondary}>
                        {isConnected === false
                            ? "Contenu du message non disponible hors connexion."
                            : "Une erreur est survenue lors du chargement du message."}
                    </Text>
                </View>
            </ScreenStack>
        );
    }

    return (
        <ScreenStack horizontalSpacing={14}>
            <GoBackHeaderView
                headerTitle={"Retour aux messages"}
                backArrow={{ color: colors.text.primary, size: 24 }}
                height={33}
                backgroundColor={colors.background.app}
                fallbackRoute={routesNames.client.messaging.content}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text preset="heading.page" style={{ marginBottom: 10, marginTop: 20 }}>
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
                                <Text preset="control.md" color={colors.text.onBrand}>
                                    {sender.initials ?? "??"}
                                </Text>
                            </View>
                            <View>
                                <Text
                                    preset="cardTitle.md"
                                    numberOfLines={1}
                                    style={{
                                        flexShrink: 1,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {sender.fullName}
                                </Text>
                                <Text
                                    preset="meta.md"
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
