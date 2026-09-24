import { Switch, Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { routesNames } from "@/router/config/routesNames";
import { sendDevReport } from "@/services/feedbackService";
import { withAlpha } from "@/themes/color";
import { useNavigation } from "@react-navigation/native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import LottieView from "lottie-react-native";
import { useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    PixelRatio,
    Platform,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SendingCheckAnimation from "../../../../assets/lottie/Sending Check.json";
import SettingSectionLayout from "./components/SettingSectionLayout";

const THEMES_OPT = { dark: "Sombre", light: "Clair" };

const FEEDBACK_OPT = [
    { name: "Général", placeHolderMessage: "Comment trouvez vous l'application ?" },
    { name: "Style", placeHolderMessage: "Joli, trop sombre, coloré, petit..." },
    {
        name: "Fonctionnalités",
        placeHolderMessage: "Ce que vous voulez, ou ce qui est peu pratique",
    },
    {
        name: "Bug",
        placeHolderMessage: "Un comportement bizarre de l'app, soyez précis.",
    },
];

const DEFAULT_TECH_SHARING = {
    modelInfo: true,
    osInfo: true,
    screenInfo: true,
    theme: true,
};

const { width, height } = Dimensions.get("window");
const scale = PixelRatio.get();

const MESSAGE_MAX_LENGTH = 500;
const TITLE_MAX_LENGTH = 50;

export default function FeedbackScreen({ route }) {
    const { label } = route.params;
    const colorScheme = useUserStore((state) => state.preferences.theme);
    const navigation = useNavigation();
    const [error, setError] = useState("");
    const { colors } = useTheme();
    const [activeChip, setActiveChip] = useState(FEEDBACK_OPT[0]);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [formValues, setFormValues] = useState({
        title: "",
        message: "",
        tech: DEFAULT_TECH_SHARING,
    });

    const updateField = (field, value) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    useEffect(() => {
        if (error === "") return;
        setTimeout(() => setError(""), 4000);
    }, [error]);

    const toggleTechSharing = (key) =>
        setFormValues((prev) => ({
            ...prev,
            tech: { ...prev.tech, [key]: !prev.tech[key] },
        }));

    const isFormValid =
        formValues.title.trim().length > 0 && formValues.message.trim().length > 0;

    const TECH_OPTIONS = useMemo(
        () => [
            {
                storeKey: "appVersion",
                title: "Version de l'application",
                locked: true,
                subtitle: Application.nativeApplicationVersion,
            },
            {
                storeKey: "modelInfo",
                title: "Modèle du téléphone",
                subtitle: `${Device.brand} ${Device.modelName}` ?? "Modèle inconnu",
            },
            {
                storeKey: "osInfo",
                title: "Version du système",
                subtitle:
                    `${Device.osName ?? Platform.OS} ${Device.osVersion ?? ""} ${Device.osBuildId ?? ""}`.trim(),
            },
            {
                storeKey: "screenInfo",
                title: "Dimensions de l'écran",
                subtitle: `${Math.round(width)} × ${Math.round(height)} px · échelle ${scale}x`,
            },
            {
                storeKey: "theme",
                title: "Thème utilisé",
                subtitle: THEMES_OPT[colorScheme] ?? "Inconnu",
            },
        ],
        [colorScheme]
    );

    const techPayload = useMemo(() => {
        return TECH_OPTIONS.reduce((acc, option) => {
            const isIncluded = option.locked || formValues.tech[option.storeKey];
            acc[option.storeKey] = isIncluded ? option.subtitle : "Partage refusé";
            return acc;
        }, {});
    }, [formValues.tech, colorScheme]);

    const feedbackPayload = {
        category: activeChip.name,
        title: formValues.title,
        message: formValues.message,
        tech: techPayload,
    };

    const sendFeedback = () => {
        if (isSending) return;
        if (!isFormValid) {
            setError("Veuillez compléter tout les champs requis (*)");
            return;
        }
        setIsSending(true);
        sendDevReport({ type: "feedback", form: feedbackPayload })
            .then(({ success, message }) => {
                if (!success && message) setError(message);
                else if (success) {
                    setFormValues({
                        title: "",
                        message: "",
                        tech: DEFAULT_TECH_SHARING,
                    });
                    setActiveChip(FEEDBACK_OPT[0]);
                    setIsSent(true);
                }
            })
            .finally(() => setIsSending(false));
    };

    if (isSent) {
        return (
            <SettingSectionLayout label={label}>
                <SafeAreaView
                    edges={["bottom"]}
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                        paddingHorizontal: 24,
                    }}
                >
                    <View
                        style={{
                            width: 94,
                            height: 94,
                            borderRadius: 90,
                            backgroundColor: "hsla(140, 60%, 55%, .16)",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 8,
                        }}
                    >
                        {/* <Text style={{ fontSize: 40 }}>✅</Text> */}
                        <LottieView
                            // autoPlay
                            loop={false}
                            autoPlay
                            source={SendingCheckAnimation}
                            style={{ width: 140, height: 140 }}
                        />
                    </View>
                    <Text preset="title1" align="center">
                        Merci pour votre retour !
                    </Text>
                    <Text
                        preset="body1"
                        color={withAlpha(colors.text.primary, 0.6)}
                        align="center"
                    >
                        Votre message a bien été envoyé à l'équipe. On y jette un œil
                        très vite.
                    </Text>
                    <Pressable
                        onPress={() => {
                            navigation.navigate(routesNames.settings.home);
                            navigation.addListener("transitionEnd", () => {
                                // to go back first and reset feedback screen after
                                setIsSent(false);
                            });
                        }}
                        style={{
                            backgroundColor: "#7C83EB",
                            paddingVertical: 14,
                            paddingHorizontal: 28,
                            borderRadius: 14,
                            alignItems: "center",
                            marginTop: 16,
                        }}
                    >
                        <Text preset="label1">Retour aux paramètres</Text>
                    </Pressable>
                </SafeAreaView>
            </SettingSectionLayout>
        );
    }

    return (
        <SettingSectionLayout
            label={label}
            subtitle={"Un bug, une idée, un coup de gueule : on lit tout."}
        >
            <ScrollView contentContainerStyle={{ gap: 16, flex: 1 }}>
                <View style={{ gap: 8 }}>
                    <Text preset="label1">Sur quoi porte votre retour ?</Text>
                    <ScrollView
                        horizontal
                        contentContainerStyle={{ gap: 8 }}
                        showsHorizontalScrollIndicator={false}
                    >
                        {FEEDBACK_OPT.map((option) => {
                            const isActive = option.name === activeChip.name;

                            return (
                                <Pressable
                                    key={option.name}
                                    onPress={() => setActiveChip(option)}
                                    style={{
                                        paddingHorizontal: 15,
                                        paddingVertical: 6,
                                        borderRadius: 25,
                                        borderColor: isActive
                                            ? colors.brand.primary
                                            : "transparent",
                                        borderWidth: 1.5,
                                        backgroundColor: isActive
                                            ? colors.brand.soft
                                            : withAlpha(colors.text.primary, 0.12),
                                    }}
                                >
                                    <Text
                                        preset="body1"
                                        color={
                                            isActive
                                                ? colors.text.brand
                                                : withAlpha(colors.text.primary, 0.6)
                                        }
                                    >
                                        {option.name}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={{ gap: 8 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Text preset="label1">Titre</Text>
                        <Text preset="title1" color="hsl(236, 74%, 70%)">
                            *
                        </Text>
                    </View>
                    <View style={{ gap: 4 }}>
                        <TextInput
                            value={formValues.title}
                            placeholder={"Résumez en quelques mots"}
                            maxLength={TITLE_MAX_LENGTH}
                            onChangeText={(text) => updateField("title", text)}
                            autoCapitalize="sentences"
                            style={{
                                backgroundColor: withAlpha(
                                    colors.text.primary,
                                    0.12
                                ),
                                borderColor: colors.border.subtle,
                                borderWidth: 1.5,
                                borderRadius: 12,
                                paddingVertical: 13,
                                paddingHorizontal: 14,
                                color: colors.text.primary,
                            }}
                            placeholderTextColor={withAlpha(
                                colors.text.primary,
                                0.4
                            )}
                        />
                        <Text preset="body3" align="right">
                            {formValues.message.length}/{TITLE_MAX_LENGTH}
                        </Text>
                    </View>
                </View>

                <View style={{ gap: 8 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <Text preset="label1">Votre message</Text>
                        <Text preset="title1" color="hsl(236, 74%, 70%)">
                            *
                        </Text>
                    </View>
                    <View style={{ gap: 4 }}>
                        <TextInput
                            value={formValues.message}
                            placeholder={activeChip.placeHolderMessage}
                            multiline
                            textAlignVertical="top"
                            maxLength={MESSAGE_MAX_LENGTH}
                            onChangeText={(text) => updateField("message", text)}
                            style={{
                                backgroundColor: withAlpha(
                                    colors.text.primary,
                                    0.12
                                ),
                                borderColor: colors.border.subtle,
                                borderWidth: 1.5,
                                borderRadius: 12,
                                paddingVertical: 13,
                                paddingHorizontal: 14,
                                height: 110,
                                color: colors.text.primary,
                            }}
                            placeholderTextColor={withAlpha(
                                colors.text.primary,
                                0.4
                            )}
                        />
                        <View style={{ flexDirection: "row" }}>
                            <Text preset="body3" style={{ flexShrink: 1 }}>
                                Note: si vous souhaitez un retour de notre part
                                pensez à indiquer un moyen de contact dans votre
                                message (Discord, e-mail, etc)
                            </Text>
                            <Text
                                preset="body3"
                                align="right"
                                style={{ flexShrink: 0 }}
                            >
                                {formValues.message.length}/{MESSAGE_MAX_LENGTH}
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={{
                        height: 2,
                        backgroundColor: "hsla(0, 0%, 100%, .3)",
                        marginVertical: 10,
                    }}
                />

                <SafeAreaView
                    edges={["bottom"]}
                    style={{ gap: 16, marginBottom: 24 }}
                >
                    <View
                        style={{
                            backgroundColor: withAlpha(
                                colors.text.primary,
                                0.09
                            ),
                            padding: 16,
                            borderRadius: 20,
                            borderColor: colors.border.subtle,
                            borderWidth: 1,
                        }}
                    >
                        <View style={{ gap: 2 }}>
                            <Text preset="label1">
                                Informations techniques envoyées
                            </Text>
                            <Text preset="body3">
                                Elles aident les developpeurs à corriger les
                                problèmes.{"\n"}
                                Choisissez ce que vous partagez.
                            </Text>
                        </View>
                        {TECH_OPTIONS.map((option, index) => (
                            <Option
                                key={option.storeKey}
                                title={option.title}
                                subtitle={option.subtitle}
                                value={formValues.tech[option.storeKey]}
                                locked={option.locked}
                                isFirst={index === 0}
                                onToggle={() => toggleTechSharing(option.storeKey)}
                            />
                        ))}
                    </View>
                    {error && <Text color="hsl(5, 33%, 52%)">{error}</Text>}
                    <Pressable
                        onPress={sendFeedback}
                        disabled={isSending}
                        style={{
                            backgroundColor: colors.surface.default,
                            paddingVertical: 14,
                            borderRadius: 14,
                            alignItems: "center",
                            opacity: isSending ? 0.6 : 1,
                        }}
                    >
                        <Text preset="label1">
                            {isSending ? "En cours d'envoi..." : "Envoyer"}
                        </Text>
                    </Pressable>
                </SafeAreaView>
            </ScrollView>
        </SettingSectionLayout>
    );
}

function Option({
    title,
    subtitle,
    value,
    onToggle,
    locked = false,
    isFirst = false,
}) {
    const { colors } = useTheme();
    return (
        <View>
            {!isFirst && (
                <View
                    style={{
                        height: 1,
                        backgroundColor: colors.border.subtle,
                        marginVertical: 12,
                    }}
                />
            )}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <View style={{ gap: 2, flex: 1 }}>
                    <Text preset="body1">{title}</Text>
                    <Text preset="body3" color={withAlpha(colors.text.primary, 0.5)}>
                        {subtitle}
                    </Text>
                </View>

                {locked ? (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: withAlpha(
                                colors.text.primary,
                                0.1
                            ),
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 8,
                        }}
                    >
                        <Text preset="body3" opacity={0.5}>
                            🔒 toujours incluse
                        </Text>
                    </View>
                ) : (
                    <Switch value={value} onValueChange={onToggle} />
                )}
            </View>
        </View>
    );
}

