import { Text } from "@/components";
import { injectHomeworksIntoModel } from "@/features/homeworks/utils/homeworks";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import dynamicBorderRadius from "@/utils/borderRadius";

import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import { formatFrenchDate } from "@/utils/date";
import { useNavigation } from "@react-navigation/native";

import { useMemo } from "react";
import { TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function HomeworksPreview({ homeworksDatas, customHomeworks }) {
    const navigation = useNavigation();
    const haptic = useHaptic("light");

    const mergedHomeworks = useMemo(() => {
        return injectHomeworksIntoModel(homeworksDatas, customHomeworks ?? []);
    }, [homeworksDatas, customHomeworks]);

    const groupedHomeworks = useMemo(() => {
        const { formatedDates = {}, ...dateGroups } = mergedHomeworks;

        return Object.entries(dateGroups)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, homeworks]) => ({
                date,
                homeworks: homeworks.filter((item) => item.isDone === "todo"),
                meta: formatedDates[date],
            }))
            .filter(({ homeworks }) => homeworks.length > 0);
    }, [mergedHomeworks]);

    return (
        <View style={{ width: "100%", flex: 1, gap: 16 }}>
            {groupedHomeworks.map(({ date, homeworks, meta }) => (
                <View key={date}>
                    <DateHeader
                        date={date}
                        meta={meta}
                        countForDate={homeworks.length}
                    />

                    {homeworks.map((item, index) => (
                        <TouchableOpacity
                            key={item.customHomeworkMd5Key ?? `${date}-${item.id}`}
                            onPress={() => {
                                haptic();
                                navigation.navigate(
                                    routesNames.client.homeworks.group,
                                    {
                                        screen: routesNames.client.homeworks.details,
                                        params: { homeworksData: item },
                                    }
                                );
                            }}
                        >
                            <Homework
                                key={
                                    item.customHomeworkMd5Key ?? `${date}-${item.id}`
                                }
                                homework={item}
                                index={index}
                                countForDate={homeworks.length}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
}

const DateHeader = ({ date, meta, countForDate }) => {
    const { colors } = useTheme();
    return (
        <View
            style={{
                paddingBottom: 4,
                paddingHorizontal: 6,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
            }}
        >
            <Text style={{ fontSize: 18, fontFamily: "SemiBold" }}>
                {(meta?.long ?? `POUR ${formatFrenchDate(date)}`).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 18, fontFamily: "Bold", color: colors.main }}>
                {countForDate} restant{countForDate > 1 ? "s" : null}
            </Text>
        </View>
    );
};

const BORDER_RADIUS_EXT = 16;
const BORDER_RADIUS_INT = 4;
const Homework = ({ homework, index, countForDate }) => {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();

    return (
        <View
            style={[
                {
                    flex: 1,
                    backgroundColor: homework.isCustom
                        ? "hsl(235, 28%, 30%)"
                        : colors.secondary,
                    marginVertical: 1.5,
                    alignItems: "center",
                    flexDirection: "row",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    gap: 10,
                    ...dynamicBorderRadius(
                        index,
                        countForDate,
                        BORDER_RADIUS_INT,
                        BORDER_RADIUS_EXT
                    ),
                },
            ]}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                    gap: 6,
                    minWidth: 0,
                }}
            >
                <Text
                    style={{
                        flexShrink: 0,
                        fontSize: 18,
                        fontFamily: "SemiBold",
                        maxWidth: "40%",
                    }}
                    oneLine
                >
                    {homework.discipline.name}
                </Text>

                <View style={{ flex: 1, flexShrink: 1, minWidth: 0 }}>
                    {homework.isCustom ? (
                        <Text
                            style={{
                                color: addOpacityToCssRgb(colors.contrast, 0.55),
                                fontSize: 14,
                                fontFamily: "Medium",
                                flexShrink: 1,
                            }}

                            oneLine
                        >
                            {homework.homeworksContent.content}
                        </Text>
                    ) : (
                        <Text oneLine color="hsla(0, 0%, 100%, .6)">
                            {homework.plainText}
                        </Text>
                    )}
                </View>
            </View>

            {homework.isEvaluation && (
                <View
                    style={{
                        flexShrink: 1,
                        backgroundColor: addOpacityToCssRgb(colors.main, 0.7),
                        borderColor: colors.main,
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: -8,
                        flexShrink: 0,
                    }}
                >
                    <Text
                        style={{
                            color: colors.contrast,
                            fontFamily: "SemiBold",
                            fontSize: 13,
                        }}
                    >
                        Contrôle
                    </Text>
                </View>
            )}
        </View>
    );
};

