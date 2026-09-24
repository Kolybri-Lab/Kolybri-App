import { GoBackHeader, ScreenStack, Text } from "@/components";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { ScrollView, View } from "react-native";

export default function SettingSectionLayout({
    label = undefined,
    subtitle = undefined,
    children,
}) {
    const { colors } = useTheme();
    return (
        <ScreenStack
            horizontalSpacing={18}
            style={{ backgroundColor: colors.background.app }}
        >
            <GoBackHeader />
            <View style={{ marginBottom: 38, marginTop: 8, gap: 6 }}>
                <Text preset="h1" style={{ fontFamily: "Petrona-Bold" }}>
                    {label}
                </Text>
                <Text preset="label2" color={withAlpha(colors.text.primary, 0.5)}>
                    {subtitle}
                </Text>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {children}
            </ScrollView>
        </ScreenStack>
    );
}

