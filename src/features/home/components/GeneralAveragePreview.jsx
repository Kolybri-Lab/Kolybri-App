import { Text } from "@/components";
import Period from "@/features/grades/models/Period";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

export default function GeneralAveragePreview({ gradesData }) {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const currentTime = useCurrentTime();
    const haptic = useHaptic("light");
    const generalAverage = useMemo(() => {
        if (!gradesData?.activePeriod) return null;
        return new Period(
            gradesData[gradesData.activePeriod.periodCode]
        ).makeGeneralAverage();
    }, [gradesData]);

    if (!gradesData?.activePeriod) {
        return null;
    }
    return (
        <TouchableOpacity
            onPress={() => {
                haptic();
                navigation.navigate(routesNames.client.grades.group, {
                    screen: routesNames.client.grades.content,
                });
            }}
            style={{
                width: "100%",
                backgroundColor: colors.surface.default,
                ...(gradesData?.lastGrades.length >= 1
                    ? {
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                          borderBottomLeftRadius: 8,
                          borderBottomRightRadius: 8,
                      }
                    : { borderRadius: 16 }),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 10,
            }}
        >
            <View style={{}}>
                <Text
                    style={{
                        color: colors.text.primary,
                        fontSize: 18,
                        fontFamily: "Bold",
                    }}
                >
                    {"Moyenne Générale".toUpperCase()}
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Text preset="label2" color={colors.text.secondary}>
                        {gradesData.activePeriod.periodName}
                    </Text>
                    <View
                        style={{
                            width: 4,
                            height: 4,
                            borderRadius: 10,
                            backgroundColor: colors.text.secondary,
                        }}
                    />
                    <Text preset="label2" color={colors.text.secondary}>
                        {currentTime.date.split("-")[0]}
                    </Text>
                </View>
            </View>
            <Text
                style={{ fontFamily: "Bold", fontSize: 32, marginTop: 3 }}
                color={colors.text.accent}
            >
                {formatGradeText(generalAverage)}
                <Text size={16} color={colors.text.secondary} fontFamily="Medium">
                    /20
                </Text>
            </Text>
        </TouchableOpacity>
    );
}

