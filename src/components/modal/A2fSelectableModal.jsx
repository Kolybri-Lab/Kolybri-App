import { useTheme } from "@/hooks/useThemeStore";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import { useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../core";

export default function A2fSelectableModal({
    visible,
    onClose,
    items,
    onSelect,
    question,
}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [emptyError, setEmptyError] = useState(false);
    const { colors } = useTheme();
    const handleSelectItem = (item) => setSelectedItem(item);

    const handleConfirmSelection = () => {
        if (!selectedItem) {
            setEmptyError(true);
            return;
        }
        onSelect(selectedItem);
        onClose();
        setEmptyError(false);
        setSelectedItem(null);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleSelectItem(item)}
            style={styles.renderItemContainer}
        >
            <View style={styles.renderItemRadioContainer}>
                <View
                    style={[
                        styles.renderItemRadioButton,
                        { borderColor: colors.border },
                        selectedItem === item && {
                            backgroundColor: colors.secondary,
                            borderColor: colors.secondary,
                        },
                    ]}
                />
            </View>
            <Text
                size={16}
                weight={selectedItem === item && "bold"}
                color={colors.main}
            >
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalContent,
                        {
                            backgroundColor: colors.bg.bg3,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.a2fText,
                            {
                                backgroundColor: addOpacityToCssRgb(
                                    colors.bg.bg1,
                                    0.5
                                ),
                            },
                        ]}
                    >
                        Authentification à deux facteurs
                    </Text>
                    <Text
                        style={[
                            styles.a2fTextInfo,
                            {
                                color: colors.main,
                            },
                        ]}
                    >
                        Ce formulaire est une mesure de sécurité mise en place par
                        EcoleDirecte afin de vérifier votre identité.
                    </Text>
                    <Text style={[styles.question]}>{question}</Text>
                    <View style={{ alignItems: "center" }}>
                        <FlatList
                            data={items}
                            renderItem={(item) => renderItem(item)}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingVertical: 10 }}
                            style={styles.flatList}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {emptyError && <Text style={{ color: "red" }}>ERREUR</Text>}
                    <View
                        style={[
                            styles.buttonsContainer,
                            {
                                backgroundColor: addOpacityToCssRgb(
                                    colors.bg.bg1,
                                    0.5
                                ),
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                onClose();
                                setEmptyError(false);
                            }}
                            style={styles.button}
                        >
                            <Text
                                style={[styles.buttonText, { color: colors.main }]}
                            >
                                Annuler
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirmSelection}
                            style={styles.button}
                        >
                            <Text
                                style={[
                                    styles.buttonSubmit,
                                    {
                                        backgroundColor: colors.border,
                                    },
                                ]}
                            >
                                Valider
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: 200,
    },
    modalContent: {
        borderRadius: 24,
        width: 335,
        overflow: "hidden",
    },
    question: {
        fontSize: 20,
        marginTop: 18,
        marginBottom: 20,
        marginHorizontal: 42,
        fontWeight: "bold",
        textAlign: "center",
    },
    flatList: {
        maxHeight: 280,
    },
    item: {
        flexDirection: "row",
        marginVertical: 5,
    },
    itemText: {
        fontSize: 16,
    },
    selectedText: {
        fontSize: 18,
        color: "#fff",
    },
    buttonsContainer: {
        position: "relative",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    button: {
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        marginLeft: 46,
    },
    buttonSubmit: {
        fontSize: 16,
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 46,
    },
    renderItemContainer: {
        flexDirection: "row",
        width: "100%",
    },
    renderItemRadioContainer: { alignItems: "center", width: 42, height: 26 },
    renderItemRadioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,

        borderWidth: 2,
    },
    renderItemText: {
        fontSize: 16,
    },

    a2fText: {
        textAlign: "center",
        paddingVertical: 22,
        fontWeight: 600,
        fontSize: 20,
    },
    a2fTextInfo: { marginHorizontal: 17, marginVertical: 8 },
});

