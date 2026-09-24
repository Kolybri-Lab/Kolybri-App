import { useTheme } from "@/hooks/useThemeStore";
import { StyleSheet, View } from "react-native";

// Le thème n'a plus de dégradé : fond uni `background.app`.
// (le nom du composant est conservé pour ne pas toucher à StyleMask.)
export default function GradientBackground({ children }) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background.app },
            ]}
        >
            {children}
        </View>
    );
}
