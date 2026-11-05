import { BackArrow } from "@/components/svg";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { useNavigation } from "@react-navigation/native";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoBackHeader({ onPress, fallbackRoute } = {}) {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const handleGoBack = () => {
        if (onPress) {
            onPress();
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        const parent = navigation.getParent();
        if (parent && parent.canGoBack && parent.canGoBack()) {
            parent.goBack();
            return;
        }

        if (fallbackRoute) {
            navigation.navigate(fallbackRoute);
            return;
        }

        try {
            navigation.goBack();
        } catch {
            // ignore
        }
    };

    return (
        <SafeAreaView
            style={{
                alignItems: "center",
                flexDirection: "row",
                zIndex: 999,
            }}
        >
            <Pressable
                onPress={handleGoBack}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                style={({ pressed }) => ({
                    top: 8,
                    opacity: pressed ? 0.5 : 1,
                    zIndex: 1000,
                })}
            >
                <View
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: withAlpha(
                            colors.text.primary,
                            0.25
                        ),
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <BackArrow size={26} />
                </View>
            </Pressable>
        </SafeAreaView>
    );
}

