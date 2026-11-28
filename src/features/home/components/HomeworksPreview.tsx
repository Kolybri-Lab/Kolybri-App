import { Text } from "@/components";
import { ProgressBar } from "@/components/progression/ProgressBar";
import type {
    FormattedDate,
    Homework as HomeworkModel,
    ResolvedHomeworks,
} from "@/features/homeworks/types";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import dynamicBorderRadius from "@/utils/borderRadius";
import { formatFrenchDate } from "@/utils/date";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

interface HomeworksPreviewProps {
    homeworksDatas?: Partial<ResolvedHomeworks>;
}

interface GroupedDateHomeworks {
    date: string;
    homeworks: HomeworkModel[];
    meta?: FormattedDate;
    total: number;
    progress: number;
}

export default function HomeworksPreview({ homeworksDatas }: HomeworksPreviewProps) {
    const navigation = useNavigation<any>();
    const haptic = useHaptic("light");

    const groupedHomeworks = useMemo<GroupedDateHomeworks[]>(() => {
        if (!homeworksDatas) return [];
        const { formatedDates = {}, ...dateGroups } = homeworksDatas;

        return Object.entries(dateGroups)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, all]) => {
                const list = Array.isArray(all) ? all : [];
                const todo = list.filter((item) => item.isDone === "todo");
                return {
                    date,
                    homeworks: todo,
                    meta: formatedDates[date],
                    total: list.length,
                    progress: list.length
                        ? (list.length - todo.length) / list.length
                        : 0,
                };
            })
            .filter(({ total }) => total > 0);
    }, [homeworksDatas]);

    return (
        <View style={{ width: "100%", flex: 1, gap: 16 }}>
            {groupedHomeworks.map(({ date, homeworks, meta, total }) => (
                <View key={date}>
                    <DateHeader
                        date={date}
                        meta={meta}
                        progress={total > 0 ? 1 - homeworks.length / total : 0}
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
                            <HomeworkItem
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

const DateHeader = ({
    date,
    meta,
    progress,
}: {
    date: string;
    meta?: FormattedDate;
    progress: number;
}) => {
    const { colors, components } = useTheme();
    return (
        <View
            style={{
                paddingBottom: 4,
                paddingHorizontal: 6,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Text preset="heading.section" size={18}>
                {(meta?.long ?? `POUR ${formatFrenchDate(date)}`).toUpperCase()}
            </Text>
            <ProgressBar
                progression={progress}
                delay={700}
                color={
                    progress === 1
                        ? colors.state.success
                        : components.progressBar.progress
                }
                style={{
                    backgroundColor: components.progressBar.track,
                    width: 70,
                    height: 8,
                }}
            />
        </View>
    );
};

const BORDER_RADIUS_EXT = 16;
const BORDER_RADIUS_INT = 4;

const HomeworkItem = ({
    homework,
    index,
    countForDate,
}: {
    homework: HomeworkModel;
    index: number;
    countForDate: number;
}) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    flex: 1,
                    backgroundColor: homework.isCustom
                        ? withAlpha(colors.text.primary, 0.08)
                        : colors.surface.default,
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
                    preset="cardTitle.lg"
                    weight="semibold"
                    style={{
                        flexShrink: 0,
                        maxWidth: "40%",
                    }}
                    oneLine
                >
                    {homework.discipline.name}
                </Text>

                <View style={{ flex: 1, flexShrink: 1, minWidth: 0 }}>
                    {homework.isCustom ? (
                        <Text
                            preset="body.md"
                            color={withAlpha(colors.text.primary, 0.55)}
                            style={{ flexShrink: 1 }}
                            oneLine
                        >
                            {homework.homeworksContent.content}
                        </Text>
                    ) : (
                        <Text preset="body.md" oneLine color={colors.text.secondary}>
                            {homework.plainText}
                        </Text>
                    )}
                </View>
            </View>

            {homework.isEvaluation && (
                <View
                    style={{
                        flexShrink: 0,
                        backgroundColor: colors.brand.primary,
                        borderRadius: 10,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: -8,
                    }}
                >
                    <Text
                        preset="badge.sm"
                        size={13}
                        color={colors.text.onBrand}
                    >
                        Contrôle
                    </Text>
                </View>
            )}
        </View>
    );
};
