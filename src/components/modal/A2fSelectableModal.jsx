import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
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
                        { borderColor: colors.border.strong },
                        selectedItem === item && {
                            backgroundColor: colors.surface.default,
                            borderColor: colors.surface.default,
                        },
                    ]}
                />
            </View>
            <Text
                preset="control.md"
                weight={selectedItem === item ? "bold" : undefined}
                color={colors.brand.primary}
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
                            backgroundColor: colors.surface.raised,
                        },
                    ]}
                >
                    <Text
                        preset="heading.section"
                        align="center"
                        style={[
                            styles.a2fText,
                            {
                                backgroundColor: withAlpha(
                                    colors.surface.muted,
                                    0.5
                                ),
                            },
                        ]}
                    >
                        Authentification à deux facteurs
                    </Text>
                    <Text
                        preset="body.md"
                        color={colors.brand.primary}
                        style={styles.a2fTextInfo}
                    >
                        Ce formulaire est une mesure de sécurité mise en place par
                        EcoleDirecte afin de vérifier votre identité.
                    </Text>
                    <Text
                        preset="heading.section"
                        align="center"
                        style={styles.question}
                    >
                        {question}
                    </Text>
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

                    {emptyError && (
                        <Text color={colors.state.warning}>ERREUR</Text>
                    )}
                    <View
                        style={[
                            styles.buttonsContainer,
                            {
                                backgroundColor: withAlpha(
                                    colors.surface.muted,
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
                                preset="control.md"
                                color={colors.brand.primary}
                                style={styles.buttonText}
                            >
                                Annuler
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirmSelection}
                            style={styles.button}
                        >
                            <Text
                                preset="control.md"
                                color={colors.text.onBrand}
                                style={[
                                    styles.buttonSubmit,
                                    {
                                        backgroundColor: colors.brand.primary,
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
        // Intentional fixed dark scrim for modal backdrop
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: 200,
    },
    modalContent: {
        borderRadius: 24,
        width: 335,
        overflow: "hidden",
    },
    question: {
        marginTop: 18,
        marginBottom: 20,
        marginHorizontal: 42,
    },
    flatList: {
        maxHeight: 280,
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
        marginLeft: 46,
    },
    buttonSubmit: {
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

    a2fText: {
        paddingVertical: 22,
    },
    a2fTextInfo: { marginHorizontal: 17, marginVertical: 8 },
});

