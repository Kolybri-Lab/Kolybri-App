import { useTheme } from "@/hooks/useThemeStore";
import appConfig from "app.config";
import { Pressable, Share, View } from "react-native";
import WinnerBadge from "../../../assets/lottie/Winner Badge.json";
import { Text } from "../core";
import AnimatedLottie from "../display/AnimatedLottie";

export default function SharePopup({ navigation }) {
    const { colors } = useTheme();

    const handleClose = () => {
        if (navigation?.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleShare = async () => {
        try {
            const url = appConfig.android.playStoreUrl;

            const result = await Share.share({
                message: `J'utilise cette app pour suivre mes cours, notes et devoirs. Tu peux la télécharger ici : ${url}`,
                url,
            });

            handleClose();
        } catch (error) {
            console.error(error);
            handleClose();
        }
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 24,
            }}
        >
            <View
                style={{
                    backgroundColor: colors.surface.default,
                    borderRadius: 22,
                    padding: 24,
                    width: "100%",
                    maxWidth: 340,
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <AnimatedLottie
                        loop={false}
                        autoPlay
                        source={WinnerBadge}
                        speed={0.65}
                        style={{ width: 90, aspectRatio: 1 }}
                    />
                </View>

                <Text
                    size={18}
                    align="center"
                    style={{
                        fontWeight: "700",
                        marginBottom: 8,
                    }}
                >
                    Fais gagner du temps à tes camarades
                </Text>

                <Text
                    size={14}
                    align="center"
                    style={{
                        color: colors.text.secondary,
                        marginBottom: 24,
                        lineHeight: 20,
                    }}
                >
                    Plus vous êtes nombreux à utiliser l'app, plus elle est utile
                    pour toute la classe : notes, emploi du temps et devoirs au
                    même endroit.
                </Text>

                <Pressable
                    style={({ pressed }) => ({
                        backgroundColor: colors.brand.highlight,
                        paddingVertical: 13,
                        paddingHorizontal: 32,
                        borderRadius: 12,
                        width: "100%",
                        alignItems: "center",
                        marginBottom: 14,
                        opacity: pressed ? 0.85 : 1,
                    })}
                    onPress={handleShare}
                >
                    <Text
                        size={15}
                        style={{
                            fontWeight: "600",
                        }}
                    >
                        Partager avec ma classe
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleClose}
                    hitSlop={8}
                    style={{ opacity: 0.4 }}
                >
                    <Text size={14}>Plus tard</Text>
                </Pressable>
            </View>
        </View>
    );
}
