import { DropDownMenu, Section, Text } from "@/components";
import { Key } from "@/components/svg";
import { downloadCustomData } from "@/helpers/documents/customDataAction";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { withAlpha } from "@/themes/color";
import { Check, Download } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import SettingSectionLayout from "./components/SettingSectionLayout";

const BUTTON_STATE = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
};

export default function DataAndConfidentialityScreen({ route }) {
    const { label } = route.params;
    const [selectedCustomData, setSelectedCustomData] = useState({
        id: "custom_homeworks",
        name: "Devoirs personnalisés",
    });
    const [buttonState, setButtonState] = useState(BUTTON_STATE.IDLE);
    const { colors } = useTheme();
    const customHomeworks = useCustomDataStore((state) => state.customHomeworks);
    const simulatedGrades = useCustomDataStore((state) => state.simulatedGrades);
    const token = useUserStore((state) => state.token);

    const download = useCallback(async () => {
        setButtonState(BUTTON_STATE.LOADING);

        const dataToExport =
            selectedCustomData.id === "custom_homeworks"
                ? customHomeworks
                : simulatedGrades;

        const result = await downloadCustomData(dataToExport, selectedCustomData.id);

        if (result.sucess) {
            setButtonState(BUTTON_STATE.SUCCESS);
            Alert.alert(
                "Téléchargement réussi",
                `Le fichier "${result.message}" a été enregistré dans votre dossier Téléchargements.`
            );
            setTimeout(() => setButtonState(BUTTON_STATE.IDLE), 2000);
        } else {
            setButtonState(BUTTON_STATE.IDLE);
            if (result.message !== "Aucune donnée à exporter") {
                Alert.alert("Erreur", "Impossible de télécharger le fichier.");
            }
        }
    }, [selectedCustomData, customHomeworks, simulatedGrades]);

    const isLoading = buttonState === BUTTON_STATE.LOADING;
    const isSuccess = buttonState === BUTTON_STATE.SUCCESS;
    const isDisabled = !selectedCustomData || isLoading;

    return (
        <SettingSectionLayout label={label}>
            <View
                style={{
                    backgroundColor: "hsla(0, 100%, 73%, 0.5)",
                    padding: 16,
                    borderRadius: 18,
                    gap: 6,
                    marginBottom: 28,
                }}
            >
                <Text align="justify" preset="body2">
                    <Text preset="label1" decoration="underline">
                        Information
                    </Text>
                    : Cette application n'est connectée à aucun service tiers, à
                    l'exception d'École Directe, dont elle dépend pour son
                    fonctionnement.
                </Text>
                <Text preset="body2">
                    Aucune donnée, qu'elle soit personnelle ou technique, n'est
                    collectée sans le consentement de l'utilisateur, stockée ou
                    transmise à des services tiers, qu'ils nous appartiennent ou non.
                </Text>
                <Text preset="label1" align="center" decoration="underline">
                    Votre vie privée est notre priorité.
                </Text>
            </View>

            <View style={{ gap: 18 }}>
                <View>
                    <Text preset="label1" style={{ marginBottom: 8 }}>
                        Télécharger vos données personnalisées
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <DropDownMenu
                                options={[
                                    {
                                        id: "custom_homeworks",
                                        name: "Devoirs personnalisés",
                                    },
                                    {
                                        id: "simulated_grades",
                                        name: "Notes simulées",
                                    },
                                ]}
                                value={selectedCustomData}
                                minWidth="100%"
                                customButtonStyle={{ height: 48 }}
                                onSelect={(value) => setSelectedCustomData(value)}
                            />
                        </View>
                        <Pressable
                            disabled={isDisabled}
                            onPress={download}
                            style={({ pressed }) => ({
                                flexShrink: 0,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                backgroundColor: isDisabled
                                    ? "#C4C4C4"
                                    : isSuccess
                                      ? "hsl(121, 56%, 34%)"
                                      : "hsl(121, 34%, 27%)",
                                opacity: pressed ? 0.85 : 1,
                                height: 48,
                                justifyContent: "center",
                                paddingHorizontal: 12,
                                borderRadius: 50,
                            })}
                        >
                            {isSuccess ? (
                                <Check size={18} color="white" />
                            ) : (
                                <Download size={18} color="white" />
                            )}
                            <Text preset="label1" style={{ color: "white" }}>
                                {isLoading
                                    ? "Téléchargement..."
                                    : isSuccess
                                      ? "Téléchargé"
                                      : "Télécharger"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
                <View>
                    <Text preset="label1" style={{ marginBottom: 8 }}>
                        Jeton d'API actuel
                    </Text>
                    <Section
                        index={0}
                        totalLength={1}
                        label={
                            token.slice(0, Math.ceil(token.length / 2)) + "********"
                        }
                        icon={
                            <Key
                                fill={withAlpha(colors.text.primary, 0.3)}
                                size={26}
                            />
                        }
                    />
                </View>
            </View>
        </SettingSectionLayout>
    );
}

