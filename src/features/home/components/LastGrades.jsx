import { Text } from "@/components";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { blendWithWhite } from "@/utils/colorGenerator";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
export default function LastGrades({ lastGradesObject }) {
    const navigation = useNavigation();
    const haptic = useHaptic("light");

    const count = lastGradesObject?.length || 0;
    if (lastGradesObject?.lenght === 0) {
        return;
    }

    return (
        <FlatList
            data={lastGradesObject}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ height: 70 }}
            keyExtractor={(item) => item.libelle}
            contentContainerStyle={{ gap: 3 }}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    onPress={() => {
                        {
                            haptic();
                            navigation.navigate(routesNames.client.grades.group, {
                                screen: routesNames.client.grades.details,
                                params: {
                                    gradeData: item,
                                    disciplineData: item.disciplineData,
                                },
                            });
                        }
                    }}
                >
                    <GradeCard
                        disciplineColor={item.disciplineColor}
                        disciplineName={item.disciplineName}
                        data={item.data}
                        index={index}
                        count={count}
                    />
                </TouchableOpacity>
            )}
        />
    );
}
const GradeCard = ({ disciplineColor, disciplineName, data, index, count }) => {
    const lightColor = useMemo(
        () => blendWithWhite(disciplineColor, 0.35),
        [disciplineColor]
    );
    const { colors } = useTheme();

    if (!disciplineName || !data) return null;
    let borderRadiusStyleLeft = {};
    let borderRadiusStyleRight = {};
    if (index === 0) {
        borderRadiusStyleLeft = {
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 16,
        };
    }
    if (index === count - 1) {
        borderRadiusStyleRight = {
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 16,
        };
    }

    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface.card,
                    borderRadius: 4,
                    width: 120,
                    height: 70,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    justifyContent: "space-between",
                },
                borderRadiusStyleLeft,
                borderRadiusStyleRight,
            ]}
        >
            <Text
                align="left"
                oneLine
                style={{ color: disciplineColor, fontSize: 14, fontFamily: "Bold" }}
            >
                {disciplineName.toUpperCase()}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    marginTop: -5,
                    marginLeft: 5,
                }}
            >
                <Text
                    style={{ fontSize: 22, fontFamily: "Bold" }}
                    color={lightColor}
                >
                    {formatGradeText(data.grade)}
                    <Text
                        style={{ fontFamily: "Medium", fontSize: 12 }}
                        color={colors.text.secondary}
                    >
                        /{data.outOf}
                    </Text>
                </Text>
                <Text
                    color={colors.text.secondary}
                    style={{
                        fontFamily: "Medium",
                        fontSize: 12,
                    }}
                >
                    ({data.coef})
                </Text>
            </View>
        </View>
    );
};

