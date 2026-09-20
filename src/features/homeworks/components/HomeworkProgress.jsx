import { Text } from "@/components/core";
import { ProgressBar } from "@/components/progression/ProgressBar";
import { useTheme } from "@/hooks/useThemeStore";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeworkProgress({
    completedCount = 0,
    totalCount = 0,
    progression,
    encouragementSentence = " ",
    sentence,
    style,
}) {
    const { colors } = useTheme();
    const computedProgression =
        progression !== undefined
            ? progression
            : totalCount > 0
              ? Math.round((completedCount / totalCount) * 100) / 100
              : 0;

    const textSentence = sentence ?? encouragementSentence;

    return (
        <SafeAreaView
            style={[
                {
                    minHeight: 160,
                    justifyContent: "space-between",
                    paddingTop: 18,
                    paddingBottom: 14,
                    gap: 14,
                },
                style,
            ]}
        >
            <View
                style={{
                    backgroundColor: colors.surface.card,
                    alignSelf: "center",
                    paddingHorizontal: 12,
                    paddingVertical: 3,
                    borderRadius: 9,
                }}
            >
                <Text align="center" preset="h3">
                    {completedCount}/{totalCount}
                </Text>
            </View>
            <ProgressBar
                progression={computedProgression}
                style={{
                    marginHorizontal: 50,
                }}
            />

            <Text preset="custom1" align="center" color="hsl(240, 34%, 77%)">
                {textSentence}
            </Text>
        </SafeAreaView>
    );
}

