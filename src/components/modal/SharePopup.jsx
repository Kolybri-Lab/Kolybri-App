import { useTheme } from "@/hooks/useThemeStore";
import appConfig from "app.config";
import { Pressable, Share, View } from "react-native";
import { Text } from "../core";
import { WinnerBadgeLottie } from "../lottie";

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
                // Intentional fixed dark scrim for modal backdrop
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
                    <WinnerBadgeLottie
                        loop={false}
                        autoPlay
                        speed={0.65}
                        style={{ width: 90, aspectRatio: 1 }}
                    />
                </View>

                <Text
                    preset="heading.section"
                    size={18}
                    weight="bold"
                    align="center"
                    style={{
                        marginBottom: 8,
                    }}
                >
                    Fais gagner du temps à tes camarades
                </Text>

                <Text
                    preset="body.md"
                    color={colors.text.secondary}
                    align="center"
                    style={{
                        marginBottom: 24,
                    }}
                >
                    Plus vous êtes nombreux à utiliser l'app, plus elle est utile
                    pour toute la classe : notes, emploi du temps et devoirs au
                    même endroit.
                </Text>

                <Pressable
                    style={({ pressed }) => ({
                        backgroundColor: colors.brand.primary,
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
                    <Text preset="control.md" color={colors.text.onBrand}>
                        Partager avec ma classe
                    </Text>
                </Pressable>

                <Pressable
                    onPress={handleClose}
                    hitSlop={8}
                    style={{ opacity: 0.4 }}
                >
                    <Text preset="control.sm">Plus tard</Text>
                </Pressable>
            </View>
        </View>
    );
}
