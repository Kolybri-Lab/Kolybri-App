import React, { useCallback, useState } from "react";
import { ListRenderItemInfo, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useTheme } from "@react-navigation/native";
import { Modal } from "@/components";
import { Text as CoreText } from "@/components/core";
const Text = CoreText as any;
import { File } from "@/components/svg";
import { useUserStore } from "@/hooks/useUserStore";
import {
    downloadDocument,
    openDocument,
} from "@/features/homeworks/utils/documents";
import { assignUnit } from "@/features/homeworks/utils/homeworks";

export interface HomeworkDocument {
    id: number | string;
    libelle: string;
    type: string;
    taille?: number;
    [key: string]: any;
}

export interface DocumentModalProps {
    visible: boolean;
    setVisible?: React.Dispatch<React.SetStateAction<boolean>> | ((visible: boolean) => void);
    documents?: HomeworkDocument[];
    renderDocuments?: (info: ListRenderItemInfo<HomeworkDocument>) => React.ReactElement | null;
    extras?: {
        colors?: any;
        [key: string]: any;
    };
    handleClose?: () => void;
}

export default function DocumentModal({
    visible,
    setVisible,
    documents = [],
    renderDocuments,
    extras,
    handleClose,
}: DocumentModalProps) {
    const theme = useTheme();
    const colors = extras?.colors || (theme.colors as any);
    const userAccessToken = useUserStore((state) => state.token);
    const [downloadProgress, setDownloadProgress] = useState<Record<string | number, number>>({});

    const defaultRenderItem = useCallback(
        ({ item }: ListRenderItemInfo<HomeworkDocument>) => {
            const { id, libelle, type, taille: size } = item;

            const prog = downloadProgress[id] ?? null;
            const ext = libelle.slice(libelle.lastIndexOf(".") + 1).toLowerCase();

            return (
                <TouchableOpacity
                    style={{
                        overflow: "hidden",
                        borderRadius: 9,
                        marginBottom: 4,
                    }}
                    key={id}
                    onPress={() =>
                        openDocument(
                            { fileName: libelle, fileType: type, fileId: id },
                            userAccessToken,
                            setDownloadProgress
                        )
                    }
                    onLongPress={() =>
                        downloadDocument(
                            { fileName: libelle, fileType: type, fileId: id },
                            userAccessToken,
                            setDownloadProgress
                        )
                    }
                    disabled={prog !== null}
                >
                    {prog !== null && (
                        <View
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${prog}%`,
                                backgroundColor: "#4CAF5066",
                                borderRadius: 9,
                            }}
                        />
                    )}
                    <View
                        style={{
                            backgroundColor:
                                prog !== null ? "transparent" : colors.bg?.bg1,
                            padding: 10,
                            borderRadius: 9,
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text preset="label2">{libelle}</Text>
                            <Text preset="label3">{assignUnit(size)}</Text>
                        </View>
                        <File fill={colors.contrast} size={25} extention={ext} />
                    </View>
                </TouchableOpacity>
            );
        },
        [colors.bg?.bg1, colors.contrast, downloadProgress, userAccessToken]
    );

    const onClose = () => {
        if (handleClose) {
            handleClose();
        } else if (setVisible) {
            setVisible(false);
        }
    };

    return (
        <Modal visible={visible} handleClose={onClose}>
            <Text preset="title1" style={{ marginBottom: 12 }}>
                Documents associés
            </Text>
            <Text
                preset="label3"
                color={colors?.txt?.txt3}
                style={{ marginBottom: 6 }}
            >
                Note du dev: maintenir pour télécharger
            </Text>
            <FlatList
                data={documents}
                renderItem={renderDocuments || defaultRenderItem}
                keyExtractor={(item) => item?.id?.toString() ?? Math.random().toString()}
                contentContainerStyle={{ gap: 7 }}
            />
        </Modal>
    );
}
