import { Text } from "@/components";
import { useWhatsNewStore } from "@/hooks/useWhatsNew";
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function AnnouncementsTestButtons() {
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
                <Text size={13} color="rgba(255, 255, 255, 0.5)">
                    📢 ANNONCES & POPUP
                </Text>
                <Text size={11} color="rgba(255, 255, 255, 0.35)">
                    Vues : {seenAnnouncementIds.length}
                </Text>
            </View>

            {/* Test 1 : Annonce standard */}
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
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                }}
            >
                <Text size={13} color="#60A5FA">
                    🟢 Ouvrir une annonce standard (texte seul)
                </Text>
            </TouchableOpacity>

            {/* Test 2 : Annonce avec lien cliquable */}
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
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                }}
            >
                <Text size={13} color="#34D399">
                    🔗 Ouvrir une annonce avec bouton de lien
                </Text>
            </TouchableOpacity>

            {/* Test 3 : Annonce alerte / maintenance */}
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
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                }}
            >
                <Text size={13} color="#F87171">
                    🚨 Ouvrir une annonce d'alerte / maintenance
                </Text>
            </TouchableOpacity>

            {/* Test 4 : Annonce longue avec défilement */}
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
                    backgroundColor: "rgba(168, 85, 247, 0.2)",
                }}
            >
                <Text size={13} color="#C084FC">
                    📜 Ouvrir une annonce longue (défilement)
                </Text>
            </TouchableOpacity>

            {/* Test 5 : Réinitialiser les annonces vues */}
            <TouchableOpacity
                onPress={() => reset()}
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                }}
            >
                <Text size={13} color="#FBBF24">
                    🔁 Réinitialiser l'historique des annonces (MMKV)
                </Text>
            </TouchableOpacity>
        </View>
    );
}

