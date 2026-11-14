import { Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { useWhatsNewStore } from "@/hooks/useWhatsNew";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function AnnouncementsTestButtons() {
    const { colors } = useTheme();
    const setTestItem = useWhatsNewStore((s) => s.setTestItem);
    const reset = useWhatsNewStore((s) => s.reset);
    const seenAnnouncementIds = useWhatsNewStore((s) => s.seenAnnouncementIds);

    return (
        <View style={{ gap: 8, width: "100%" }}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Text size={13} color={colors.text.secondary}>
                    📢 ANNONCES & POPUP
                </Text>
                <Text size={11} color={withAlpha(colors.text.secondary, 0.7)}>
                    Vues : {seenAnnouncementIds.length}
                </Text>
            </View>

            <TouchableOpacity
                onPress={() =>
                    setTestItem({
                        kind: "announcement",
                        announcement: {
                            id: "test-standard",
                            title: "Bienvenue sur Kolybri !",
                            message:
                                "Ceci est une annonce de test standard. Elle permet de vérifier la mise en page et la typographie.",
                            type: "community",
                        },
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    🟢 Ouvrir une annonce standard (texte seul)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    setTestItem({
                        kind: "announcement",
                        announcement: {
                            id: "test-link",
                            title: "Rejoins notre Discord !",
                            message:
                                "Tu souhaites échanger avec nous ou signaler un retour ? Clique sur le bouton ci-dessous pour nous rejoindre !",
                            link: {
                                label: "Rejoindre le Discord nom très très long",
                                url: "https://discord.gg/AKAqXfTgvE",
                            },
                            type: "community",
                        },
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.success, 0.15),
                }}
            >
                <Text size={13} color={colors.state.success}>
                    🔗 Ouvrir une annonce avec lien web externe
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    setTestItem({
                        kind: "announcement",
                        announcement: {
                            id: "test-inapp-link",
                            title: "Mise à jour disponible ! 🎉",
                            message:
                                "Découvre toutes les nouveautés et améliorations apportées dans la dernière version de Kolybri directement dans les notes de version.",
                            link: {
                                label: "Voir les notes de version",
                                url: "kolybri://settings/release-notes",
                            },
                            type: "community",
                        },
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    📱 Ouvrir une annonce avec deep link in-app (Notes de version)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    setTestItem({
                        kind: "announcement",
                        announcement: {
                            id: "test-alert",
                            title: "🚨 Maintenance programmée",
                            message:
                                "Les serveurs d'ÉcoleDirecte seront perturbés ce soir de 22h à 23h. La synchronisation automatique sera temporairement suspendue.",
                            type: "alert",
                            link: {
                                label: "En savoir plus",
                                url: "https://statut.ecoledirecte.com",
                            },
                        },
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🚨 Ouvrir une annonce d'alerte / maintenance
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    setTestItem({
                        kind: "announcement",
                        announcement: {
                            id: "test-scroll",
                            title: "Grand concours de la rentrée 🏆",
                            message:
                                "Salut la commu Kolybri !\n\n" +
                                "Nous lançons un grand concours pour fêter la nouvelle mise à jour de l'application !\n\n" +
                                "1. Partage l'application à 3 amis de ta classe.\n" +
                                "2. Envoie une capture d'écran sur notre Discord.\n" +
                                "3. Tente de remporter un badge exclusif et l'accès aux bêtas privées !\n\n" +
                                "Merci à toutes et à tous pour votre soutien au quotidien et vos précieux retours. Vous êtes plus de 10 000 à utiliser Kolybri chaque jour !",
                            type: "community",
                            link: {
                                label: "Participer sur Discord",
                                url: "https://discord.gg/AKAqXfTgvE",
                            },
                        },
                    })
                }
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.brand.primary, 0.15),
                }}
            >
                <Text size={13} color={colors.brand.primary}>
                    📜 Ouvrir une annonce longue (défilement)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => reset()}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: withAlpha(colors.state.warning, 0.15),
                }}
            >
                <Text size={13} color={colors.state.warning}>
                    🔁 Réinitialiser l'historique des annonces (MMKV)
                </Text>
            </TouchableOpacity>
        </View>
    );
}

