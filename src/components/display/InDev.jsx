import { CONFIG } from "@/constants/config";
import { useTheme } from "@/hooks/useThemeStore";
import { getShadow } from "@/themes/tokens";
import { withAlpha } from "@/themes/color";
import { StyleSheet, View } from "react-native";
import { Text } from "../core";
import LinkText from "./LinkText";

export default function InDev({}) {
    const { colors, isDark } = useTheme();
    const shadow = getShadow(isDark);
    const mainColor = withAlpha(colors.brand.primary, 0.7);
    const shadowColor = withAlpha(shadow.color, shadow.opacity);
    const caseColor = withAlpha(colors.surface.raised, 0.8);
    return (
        <View style={[styles.parent]}>
            <View
                style={[
                    styles.children,
                    {
                        backgroundColor: caseColor,
                        boxShadow: "2px 2px 15px 3px " + shadowColor,
                    },
                ]}
            >
                <Text align="center" preset="body1" color={mainColor}>
                    Fonctionnalité en cours de développement...
                </Text>

                <Text align="center" preset="body1" color={mainColor}>
                    Rejoignez le{" "}
                    <LinkText href={CONFIG.discordInviteLink} color={mainColor}>
                        serveur Discord d'Kolybri
                    </LinkText>{" "}
                    pour en suivre l'avancée !
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    parent: {
        height: "100%",
        alignItems: "center",
        marginHorizontal: "4%",
    },
    children: {
        borderRadius: 18,
        height: "27%",
        padding: 20,
        justifyContent: "center",
    },
});

