// components/share/SharePopup.jsx
import { useTheme } from "@/hooks/useThemeStore";
import appConfig from "app.config";
import LottieView from "lottie-react-native";
import { Modal, Platform, Pressable, Share, View } from "react-native";
import WinnerBadge from "../../../assets/lottie/Winner Badge.json";
import { Text } from "../core";

export default function SharePopup({ visible, onClose, onShared }) {
    const { colors } = useTheme();

    const handleShare = async () => {
        try {
            const url =
                Platform.OS === "android"
                    ? appConfig.android.playStoreUrl
                    : appConfig.ios.appStoreUrl;
            const result = await Share.share({
                message: `J'utilise cette app pour suivre mes cours, notes et devoirs. Tu peux la télécharger ici : ${url}`,
                url, // used on ios
            });

            if (result.action === Share.sharedAction) {
                onShared?.();
            } else {
                onClose();
            }
        } catch (error) {
            console.error(error);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
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
                        <LottieView
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
                        onPress={onClose}
                        hitSlop={8}
                        style={{ opacity: 0.4 }}
                    >
                        <Text size={14}>Plus tard</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}
