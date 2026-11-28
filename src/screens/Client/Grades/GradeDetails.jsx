import { Text } from "@/components/core";
import {
    BestGrade,
    EqualToDisciplineAverage,
    MaxGrade,
    UpperThanClassAverage,
    UpperThanDisciplineAverage,
    UpTheStreak,
} from "@/components/svg";
import { useGrades } from "@/features/grades";
import Discipline from "@/features/grades/models/Discipline";
import Grade from "@/features/grades/models/Grade";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { routesNames } from "@/router/config/routesNames";
import { formatFrenchDate } from "@/utils/date";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { GoBackHeader } from "../../../components";

const UI_BADGES = {
    max_grade: MaxGrade,
    best_grade: BestGrade,
    upper_than_class_average: UpperThanClassAverage,
    upper_than_discipline_average: UpperThanDisciplineAverage,
    up_the_streak: UpTheStreak,
    equal_to_discipline_average: EqualToDisciplineAverage,
};


export default function GradeDetails({ route }) {
    const token = useUserStore((state) => state.token);
    const { data: gradesData } = useGrades(token);
    const { colors } = useTheme();
    const { gradeData, disciplineData: initialDisciplineData } = route?.params || {};

    const grade = useMemo(() => new Grade(gradeData), [gradeData]);

    const disciplineData = useMemo(() => {
        if (initialDisciplineData && Object.keys(initialDisciplineData).length > 0) {
            return initialDisciplineData;
        }

        // Fallback: chercher dans les périodes de gradesData
        const periodCode = grade.codes?.period;
        const disciplineCode = grade.codes?.discipline;

        if (gradesData && periodCode && disciplineCode) {
            const period = gradesData[periodCode];
            if (period?.groups) {
                for (const group of period.groups) {
                    if (
                        group.isDisciplineGroup &&
                        Array.isArray(group.disciplines)
                    ) {
                        const found = group.disciplines.find(
                            (d) => d.code === disciplineCode
                        );
                        if (found) return found;
                    } else if (group.code === disciplineCode) {
                        return group;
                    }
                }
            }
        }
        return initialDisciplineData || {};
    }, [
        initialDisciplineData,
        grade.codes?.period,
        grade.codes?.discipline,
        gradesData,
    ]);

    const discipline = useMemo(
        () => new Discipline(disciplineData),
        [disciplineData]
    );

    return (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ marginHorizontal: 22, flex: 1 }}>
                <GoBackHeader fallbackRoute={routesNames.client.grades.content} />
                <View
                    style={{
                        backgroundColor: colors.surface.default,
                        flexDirection: "row",
                        padding: 24,
                        borderRadius: 10,
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View style={{ flexDirection: "column", maxWidth: "70%" }}>
                        <Text preset="cardTitle.md">{grade.libelle}</Text>
                        <Teachers teachers={discipline.teachers} />
                    </View>
                    <View
                        style={{
                            backgroundColor: colors.surface.raised,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                        }}
                    >
                        <Text preset="metric.md">
                            {formatGradeText(
                                discipline.getWeightedAverage() ??
                                    discipline.averageDatas?.userAverage
                            )}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
                    <Cards datas={grade.data} />
                </View>

                <View
                    style={{
                        backgroundColor: colors.surface.default,
                        borderRadius: 22,
                        flex: 1,
                        marginVertical: 14,
                        alignItems: "center",
                        padding: 14,
                    }}
                >
                    <Text preset="heading.page" color={colors.brand.primary}>
                        Informations
                    </Text>

                    {grade.badges?.length > 0 && (
                        <View
                            style={{
                                flexDirection: "row",
                                gap: 10,
                                marginHorizontal: 10,
                                backgroundColor: colors.surface.muted,
                                paddingVertical: 10,
                                paddingHorizontal: 12,
                                borderRadius: 8,
                                marginTop: 8,
                            }}
                        >
                            {grade.badges.map((badge, i) => {
                                const BadgeComponent = UI_BADGES[badge];
                                if (!BadgeComponent) return null;
                                return (
                                    <BadgeComponent
                                        key={`${badge}-${i}`}
                                        size={22}
                                    />
                                );
                            })}
                        </View>
                    )}

                    <View
                        style={{
                            alignSelf: "flex-start",
                            marginTop: 8,
                            marginBottom: 10,
                        }}
                    >
                        <Text preset="body.md">
                            · Type d'évaluation :{" "}
                            {grade.homeworkType || "Non spécifié"}
                        </Text>
                        <Text preset="body.md">
                            · Date : {formatFrenchDate(grade.date)}
                        </Text>
                    </View>

                    <View>
                        {(grade.skills || []).map((item, index) => (
                            <View
                                key={index}
                                style={{ minWidth: "90%", marginVertical: 10 }}
                            >
                                <Text
                                    style={{
                                        marginBottom: 4,
                                    }}
                                    color={colors.text.primary} // EDIT
                                    preset="cardTitle.md"
                                    weight="medium"
                                >
                                    {item?.name}
                                </Text>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            marginLeft: 16,
                                            flex: 1,
                                        }}
                                        color={colors.text.secondary} // EDIT
                                        preset="body.md"
                                    >
                                        {item?.description}
                                    </Text>
                                    <Text
                                        style={{
                                            marginLeft: 8,
                                            width: "30%",
                                            flexShrink: 1,
                                        }}
                                        align="right"
                                        preset="meta.md"
                                        color={item?.value?.color}
                                    >
                                        {item?.value?.label}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const Teachers = ({ teachers = [] }) => {
    const safeTeachers = Array.isArray(teachers) ? teachers : [];
    const { colors } = useTheme();
    if (safeTeachers.length > 1) {
        return safeTeachers.map((teacher, i) => (
            <Text key={i} oneLine preset="meta.md" color={colors.text.secondary}>
                - {teacher}
            </Text>
        ));
    }

    if (safeTeachers.length === 1) {
        return (
            <Text oneLine preset="meta.md" color={colors.text.secondary}>
                {safeTeachers[0]}
            </Text>
        );
    }

    return (
        <Text preset="meta.sm" color={colors.text.secondary}>
            Aucun enseignant pour cette discipline
        </Text>
    );
};

const Cards = ({ datas }) => {
    const { grade = null, coef = 0, outOf = 20 } = datas || {};
    const { colors } = useTheme();
    const cards = [
        { label: "Note obtenue", value: formatGradeText(grade) },
        { label: "Coefficient", value: formatGradeText(coef, "auto") },
        { label: "Dénominateur", value: `/${outOf}` },
    ];

    return (
        <>
            {cards.map((card, index) => (
                <View
                    key={index}
                    style={{
                        backgroundColor: colors.surface.default,
                        flex: 1,
                        flexShrink: 0,
                        aspectRatio: 1,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "space-evenly",
                    }}
                >
                    <Text
                        preset="meta.md"
                        numberOfLines={2}
                        color={colors.text.secondary} // EDIT
                    >
                        {card.label}
                    </Text>
                    <Text preset="metric.md">
                        {card.value}
                    </Text>
                </View>
            ))}
        </>
    );
};

