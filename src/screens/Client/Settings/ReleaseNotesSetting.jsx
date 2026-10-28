import { LoadingSpinner, Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import SettingSectionLayout from "./components/SettingSectionLayout";

const OFFICIAL_CHANGELOG_URL =
    "https://kolybri-lab.github.io/kolybri-announcements/changelog.json";

const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    } catch {
        return isoString;
    }
};

const getVersionStyle = (version, index, colors) => {
    const trimmed = (version || "").trim();
    const isMajor = /^\d+\.0\.0$/.test(trimmed);

    // 1. La dernière version en date (index 0) ou les versions majeures x.0.0
    if (index === 0 || isMajor) {
        return {
            color: colors.brand.primary,
            textColor: colors.text.onBrand,
        };
    }

    // 2. Les versions x.x.0 (mineures)
    const isMinor = /^\d+\.\d+\.0$/.test(trimmed);
    if (isMinor) {
        return {
            color: colors.brand.vivid,
            textColor: colors.text.onBrand,
        };
    }

    // 3. Le reste (patchs x.x.y)
    return {
        color: colors.brand.soft,
        textColor: colors.text.primary,
    };
};

const getBadgeStyle = (type, colors) => {
    switch (type) {
        case "new":
            return {
                label: "Nouveau",
                bg: "rgba(16, 185, 129, 0.12)",
                text: "#10B981",
            };
        case "improved":
            return {
                label: "Amélioration",
                bg: "rgba(59, 130, 246, 0.12)",
                text: "#3B82F6",
            };
        case "fix":
            return {
                label: "Correctif",
                bg: "rgba(245, 158, 11, 0.12)",
                text: "#F59E0B",
            };
        default:
            return {
                label: type || "Autre",
                bg: colors.surface.muted,
                text: colors.text.secondary,
            };
    }
};

export default function ReleaseNotesScreen({ route }) {
    const { label } = route.params;
    const { colors } = useTheme();

    const {
        data: releases,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["app-changelog"],
        queryFn: async () => {
            const res = await fetch(`${OFFICIAL_CHANGELOG_URL}?t=${Date.now()}`, {
                headers: {
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                },
            });
            if (!res.ok) throw new Error("Erreur de chargement du changelog");
            const text = await res.text();
            if (!text || !text.trim()) return [];
            const json = JSON.parse(text);
            return Array.isArray(json) ? json : (json.changelog ?? []);
        },
        staleTime: 1000 * 60 * 5,
    });

    return (
        <SettingSectionLayout
            label={label}
            subtitle="Historique des mises à jour et nouveautés"
        >
            <View style={{ paddingBottom: 40, paddingTop: 4 }}>
                {isLoading && (
                    <View style={{ paddingVertical: 40, alignItems: "center" }}>
                        <LoadingSpinner size={32} />
                    </View>
                )}

                {isError && (
                    <View
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: colors.surface.default,
                            alignItems: "center",
                        }}
                    >
                        <Text color={colors.text.secondary} align="center">
                            Impossible de charger les notes de version pour le
                            moment.
                        </Text>
                    </View>
                )}

                {!isLoading && !isError && (!releases || releases.length === 0) && (
                    <View
                        style={{
                            padding: 20,
                            borderRadius: 20,
                            backgroundColor: colors.surface.default,
                            alignItems: "center",
                        }}
                    >
                        <Text color={colors.text.secondary} align="center">
                            Aucune note de version disponible.
                        </Text>
                    </View>
                )}

                {releases &&
                    releases.map((release, index) => {
                        const isLatest = index === 0;
                        const isLast = index === releases.length - 1;
                        const isPatch =
                            release.version && !release.version.endsWith(".0");
                        const showTitle = !isPatch && Boolean(release.title);
                        const versionStyle = getVersionStyle(
                            release.version,
                            index,
                            colors
                        );

                        return (
                            <View
                                key={release.version || index}
                                style={{
                                    flexDirection: "row",
                                    position: "relative",
                                }}
                            >
                                {/* Axe vertical de la timeline */}
                                <View
                                    style={{
                                        width: 22,
                                        alignItems: "center",
                                        marginRight: 10,
                                    }}
                                >
                                    {/* Ligne verticale de liaison */}
                                    {!isLast && (
                                        <View
                                            style={{
                                                position: "absolute",
                                                top: 14,
                                                bottom: -16,
                                                width: 2,
                                                backgroundColor: withAlpha(
                                                    colors.text.primary,
                                                    0.08
                                                ),
                                                borderRadius: 1,
                                            }}
                                        />
                                    )}

                                    {/* Nœud / Point de la version */}
                                    <View
                                        style={{
                                            width: isLatest ? 14 : 10,
                                            height: isLatest ? 14 : 10,
                                            borderRadius: 10,
                                            backgroundColor: versionStyle.color,
                                            marginTop: 14,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {isLatest && (
                                            <View
                                                style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 4,
                                                    backgroundColor:
                                                        colors.text.onBrand ??
                                                        "#FFFFFF",
                                                }}
                                            />
                                        )}
                                    </View>
                                </View>

                                {/* Conteneur carte de la version (sans bordure) */}
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.surface.default,
                                        borderRadius: 20,
                                        padding: 16,
                                        marginBottom: 16,
                                        gap: 10,
                                    }}
                                >
                                    {/* En-tête : Badge version + Date */}
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <View
                                            style={{
                                                backgroundColor: versionStyle.color,
                                                paddingVertical: 3,
                                                paddingHorizontal: 9,
                                                borderRadius: 100,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: versionStyle.textColor,
                                                    fontFamily: "SemiBold",
                                                    fontSize: 12,
                                                    includeFontPadding: false,
                                                }}
                                            >
                                                v{release.version}
                                            </Text>
                                        </View>

                                        {release.date && (
                                            <Text
                                                size={12}
                                                color={colors.text.secondary}
                                                style={{ fontFamily: "Medium" }}
                                            >
                                                {formatDate(release.date)}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Titre optionnel (versions x.x.0 uniquement) */}
                                    {showTitle && (
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontFamily: "SemiBold",
                                                color: colors.text.primary,
                                                marginTop: 1,
                                            }}
                                        >
                                            {release.title}
                                        </Text>
                                    )}

                                    {/* Liste des changements */}
                                    {release.changes &&
                                        release.changes.length > 0 && (
                                            <View style={{ gap: 8, marginTop: 2 }}>
                                                {release.changes.map(
                                                    (change, cIdx) => {
                                                        const badge = getBadgeStyle(
                                                            change.type,
                                                            colors
                                                        );
                                                        return (
                                                            <View
                                                                key={cIdx}
                                                                style={{
                                                                    flexDirection:
                                                                        "row",
                                                                    alignItems:
                                                                        "flex-start",
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            badge.bg,
                                                                        paddingVertical: 2,
                                                                        paddingHorizontal: 6,
                                                                        borderRadius: 6,
                                                                        marginTop: 1,
                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={{
                                                                            color: badge.text,
                                                                            fontSize: 11,
                                                                            fontFamily:
                                                                                "SemiBold",
                                                                        }}
                                                                    >
                                                                        {badge.label}
                                                                    </Text>
                                                                </View>

                                                                <Text
                                                                    style={{
                                                                        flex: 1,
                                                                        fontSize: 13,
                                                                        lineHeight: 18,
                                                                        color: colors
                                                                            .text
                                                                            .secondary,
                                                                    }}
                                                                >
                                                                    {change.text}
                                                                </Text>
                                                            </View>
                                                        );
                                                    }
                                                )}
                                            </View>
                                        )}
                                </View>
                            </View>
                        );
                    })}
            </View>
        </SettingSectionLayout>
    );
}

