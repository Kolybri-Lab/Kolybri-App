import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SettingSectionLayout from "./components/SettingSectionLayout";

export default function ReleaseNotesScreen({ route }) {
    const { label } = route.params;
    const { colors } = useTheme();
    return (
        <SettingSectionLayout label={label}>
            <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: withAlpha(
                            colors.surface.simpleOpacity,
                            0.24
                        ),
                        borderRadius: 32,
                        marginBottom: 30,
                        marginHorizontal: 10,
                    }}
                ></View>
            </SafeAreaView>
        </SettingSectionLayout>
    );
}

