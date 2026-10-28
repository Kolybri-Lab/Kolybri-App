// components/WhatsNewModal.tsx
import { useTheme } from "@/hooks/useThemeStore";
import { AnnouncementItem, ChangelogItem, WhatsNewItem } from "@/hooks/useWhatsNew";
import { openUrl } from "@/utils/url";
import * as Application from "expo-application";
import { Link } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type Props = {
    item: WhatsNewItem | null;
    dismiss: () => void;
};

export default function WhatsNewModal({ item, dismiss }: Props) {
    const { colors } = useTheme();
    if (!item) return null;

    return (
        <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: 22,
                    backgroundColor: colors.background.modal,
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.surface.default,
                        borderRadius: 28,
                        padding: 20,
                        //borderColor: colors.border.subtle,
                        //borderWidth: 1.75,
                        maxHeight: "80%",
                    }}
                >
                    {item.kind === "changelog" ? (
                        <ChangelogLayout entries={item.entries} />
                    ) : (
                        <AnnouncementLayout announcement={item.announcement} />
                    )}

                    <View
                        style={{
                            marginTop: 16,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        {item.kind === "announcement" && item.announcement.link ? (
                            <Pressable
                                accessibilityRole="link"
                                onPress={() => openUrl(item.announcement.link?.url)}
                                hitSlop={6}
                                style={({ pressed }) => ({
                                    backgroundColor: colors.brand.primary,
                                    paddingVertical: 5,
                                    paddingHorizontal: 12,
                                    borderRadius: 100,
                                    opacity: pressed ? 0.8 : 1,
                                    flexShrink: 1,
                                })}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        gap: 5,
                                        alignItems: "center",
                                        flexShrink: 1,
                                    }}
                                >
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                        style={{
                                            color: colors.text.onBrand,
                                            fontFamily: "SemiBold",
                                            fontSize: 13,
                                            includeFontPadding: false,
                                            flexShrink: 1,
                                        }}
                                    >
                                        {item.announcement.link.label}
                                    </Text>
                                    <View style={{ flexShrink: 0 }}>
                                        <Link color={colors.text.onBrand} size={12} />
                                    </View>
                                </View>
                            </Pressable>
                        ) : (
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: colors.text.secondary,
                                    fontSize: 13,
                                    fontFamily: "Medium",
                                    marginLeft: 6,
                                    flexShrink: 1,
                                }}
                            >
                                v{Application.nativeApplicationVersion ?? "0.0.0"}
                            </Text>
                        )}

                        <Pressable
                            onPress={dismiss}
                            accessibilityRole="button"
                            hitSlop={6}
                            style={({ pressed }) => ({
                                paddingVertical: 5,
                                paddingHorizontal: 12,
                                borderRadius: 100,
                                borderWidth: 1,
                                borderColor: colors.brand.primary,
                                opacity: pressed ? 0.7 : 1,
                                flexShrink: 0,
                            })}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    color: colors.text.brand,
                                    fontSize: 13,
                                    fontFamily: "SemiBold",
                                    includeFontPadding: false,
                                }}
                            >
                                Fermer
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function ChangelogLayout({ entries }: { entries: ChangelogItem[] }) {
    const { colors } = useTheme();
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {entries.map((e) => (
                <View key={e.version} style={{ marginBottom: 16 }}>
                    <Text
                        style={{
                            fontFamily: "Petrona-SemiBold",
                            textDecorationStyle: "solid",
                            textDecorationLine: "underline",
                            fontSize: 22,
                            color: colors.text.primary,
                            marginLeft: 6,
                            marginBottom: 8,
                        }}
                    >
                        {e.title ?? `Version ${e.version} 🎉`} :
                    </Text>
                    <View
                        style={{
                            flexShrink: 1,
                            marginTop: 10,
                            borderRadius: 18,
                            backgroundColor: colors.surface.muted,
                            padding: 10,
                        }}
                    >
                        {e.changes.map((c, i) => (
                            <Text key={i} style={{ color: colors.text.primary }}>
                                • [{c.type}] {c.text}
                            </Text>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

function AnnouncementLayout({ announcement }: { announcement: AnnouncementItem }) {
    const { colors } = useTheme();
    return (
        <View style={{ flexShrink: 1 }}>
            <Text
                style={{
                    fontFamily: "SemiBold",
                    fontSize: 22,
                    color: colors.text.primary,
                    marginLeft: 6,
                    marginBottom: 8,
                }}
            >
                {announcement.title}
            </Text>
            <ScrollView
                style={{
                    flexShrink: 1,
                    marginTop: 6,
                    maxHeight: 280,
                }}
                contentContainerStyle={{ paddingHorizontal: 6, paddingVertical: 4 }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={{
                        color: colors.text.secondary,
                        fontSize: 14,
                        lineHeight: 20,
                        textAlign: "left",
                        fontFamily: "Medium",
                    }}
                >
                    {announcement.message}
                </Text>
            </ScrollView>
        </View>
    );
}

