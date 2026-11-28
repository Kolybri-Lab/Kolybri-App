import { Text } from "@/components";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { useNavigation } from "@react-navigation/native";
import { FlatList, TouchableOpacity, View } from "react-native";

const RADIUS_IN = 4;
const RADIUS_OUT = 16;
export default function LastGrades({ lastGradesObject }) {
    const navigation = useNavigation();
    const haptic = useHaptic("light");

    const count = lastGradesObject?.length || 0;
    if (count === 0) {
        return null;
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
    const { colors } = useTheme();

    if (!disciplineName || !data) return null;

    let borderBottomRadius = {};
    if (index === 0 && count > 1) {
        borderBottomRadius = {
            borderBottomLeftRadius: RADIUS_OUT,
            borderBottomRightRadius: RADIUS_IN,
        };
    } else if (count === 1) {
        borderBottomRadius = {
            borderBottomLeftRadius: RADIUS_OUT,
            borderBottomRightRadius: RADIUS_OUT,
        };
    } else if (index === count - 1 && count > 1) {
        borderBottomRadius = {
            borderBottomLeftRadius: RADIUS_IN,
            borderBottomRightRadius: RADIUS_OUT,
        };
    } else if (count > 1) {
        borderBottomRadius = {
            borderBottomLeftRadius: RADIUS_IN,
            borderBottomRightRadius: RADIUS_IN,
        };
    }
    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface.default,
                    // borderRadius: 4,
                    borderTopRightRadius: RADIUS_IN,
                    borderTopLeftRadius: RADIUS_IN,
                    width: 120,
                    height: 70,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    justifyContent: "space-between",
                },
                borderBottomRadius,
            ]}
        >
            <Text
                preset="cardTitle.sm"
                align="left"
                oneLine
                color={disciplineColor}
                maxFontSizeMultiplier={1.15}
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
                    preset="metric.md"
                    color={withAlpha(disciplineColor, 0.9)}
                    maxFontSizeMultiplier={1.15}
                >
                    {formatGradeText(data.grade)}
                    <Text
                        preset="meta.sm"
                        color={colors.text.secondary}
                        maxFontSizeMultiplier={1.15}
                    >
                        /{data.outOf}
                    </Text>
                </Text>
                <Text
                    preset="meta.sm"
                    color={colors.text.secondary}
                    maxFontSizeMultiplier={1.15}
                >
                    ({data.coef})
                </Text>
            </View>
        </View>
    );
};
