// components/WhatsNewModal.tsx
import { useTheme } from "@/hooks/useThemeStore";
import { AnnouncementItem, ChangelogItem, WhatsNewItem } from "@/hooks/useWhatsNew";
import { Link } from "lucide-react-native";
import { Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";

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
                        borderColor: colors.border.subtle,
                        borderWidth: 1.75,
                        maxHeight: "80%",
                    }}
                >
                    {item.kind === "changelog" ? (
                        <ChangelogLayout entries={item.entries} />
                    ) : (
                        <AnnouncementLayout announcement={item.announcement} />
                    )}

                    <Pressable
                        onPress={dismiss}
                        accessibilityRole="button"
                        style={{ marginTop: 8, alignSelf: "flex-end" }}
                    >
                        <Text
                            style={{ color: colors.text.brand, fontWeight: "600" }}
                        >
                            Fermer
                        </Text>
                    </Pressable>
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
                    fontFamily: "Petrona-SemiBold",
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
                    marginTop: 10,
                    borderRadius: 18,
                    backgroundColor: colors.surface.muted,
                }}
                contentContainerStyle={{ padding: 12 }}
            >
                <Text style={{ color: colors.text.primary }}>
                    {announcement.message}
                </Text>
            </ScrollView>
            {announcement.link && (
                <Pressable
                    accessibilityRole="link"
                    onPress={() => Linking.openURL(announcement.link.url)}
                    style={{
                        marginTop: 12,
                        backgroundColor: colors.brand.primary,
                        alignSelf: "flex-start",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 100,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 6,
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{ color: colors.text.primary, fontWeight: "600" }}
                        >
                            {announcement.link.label}
                        </Text>
                        <Link color={colors.text.primary} size={14} />
                    </View>
                </Pressable>
            )}
        </View>
    );
}

