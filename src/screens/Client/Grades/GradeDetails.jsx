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
import { FlatList, View } from "react-native";
import { GoBackHeader } from "../../../components";

const UI_BADGES = {
    max_grade: MaxGrade,
    best_grade: BestGrade,
    upper_than_class_average: UpperThanClassAverage,
    upper_than_discipline_average: UpperThanDisciplineAverage,
    up_the_streak: UpTheStreak,
    equal_to_discipline_average: EqualToDisciplineAverage,
};

const SKILLS_COLORS = {
    "Non acquis": "hsl(0, 40%, 50%)",
    "Partiellement acquis": "hsl(60, 70%, 40%)",
    Acquis: "hsl(200, 40%, 50%)",
    Dépassé: "hsl(130, 50%, 60%)",
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

    const renderItem = ({ item }) => (
        <View style={{ minWidth: "90%", marginVertical: 10 }}>
            <Text
                style={{
                    marginBottom: 4,
                }}
                decoration="underline"
                color={"hsl(240, 40%, 75%)"} // EDIT
                preset="body1"
            >
                {item?.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                    style={{
                        marginLeft: 16,
                        flex: 1,
                    }}
                    color={"hsl(240, 40%, 68%)"} // EDIT
                    preset="body2"
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
                    preset="label2"
                    color={SKILLS_COLORS[item?.value]}
                >
                    {item?.value}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={{ marginHorizontal: 22, flex: 1 }}>
                <GoBackHeader fallbackRoute={routesNames.client.grades.content} />
                <View
                    style={{
                        backgroundColor: colors.surface.card,
                        flexDirection: "row",
                        padding: 24,
                        borderRadius: 10,
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <View style={{ flexDirection: "column", maxWidth: "70%" }}>
                        <Text preset="label1">{grade.disciplineName}</Text>
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
                        <Text preset="h3">
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
                        backgroundColor: colors.surface.card,
                        borderRadius: 22,
                        flex: 1,
                        marginVertical: 14,
                        alignItems: "center",
                        padding: 14,
                    }}
                >
                    <Text preset="h2" color={colors.text.secondary}>
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
                        <Text preset="label2">
                            · Type d'évaluation :{" "}
                            {grade.homeworkType || "Non spécifié"}
                        </Text>
                        <Text preset="label2">
                            · Date : {formatFrenchDate(grade.date)}
                        </Text>
                    </View>

                    <FlatList
                        data={grade.skills || []}
                        renderItem={renderItem}
                        keyExtractor={(_, i) => i.toString()}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        style={{ width: "100%" }}
                    />
                </View>
            </View>
        </View>
    );
}

const Teachers = ({ teachers = [] }) => {
    const safeTeachers = Array.isArray(teachers) ? teachers : [];
    const { colors } = useTheme();
    if (safeTeachers.length > 1) {
        return safeTeachers.map((teacher, i) => (
            <Text
                key={i}
                oneLine
                preset="label2"
                color={colors.text.secondaryContrast}
            >
                - {teacher}
            </Text>
        ));
    }

    if (safeTeachers.length === 1) {
        return (
            <Text oneLine preset="label2" color={colors.text.secondaryContrast}>
                {safeTeachers[0]}
            </Text>
        );
    }

    return (
        <Text preset="label3" color={"hsl(320, 52%, 55%)"} /* EDIT */>
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
                        backgroundColor: colors.surface.card,
                        flex: 1,
                        flexShrink: 0,
                        aspectRatio: 1,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "space-evenly",
                    }}
                >
                    <Text
                        preset="label2"
                        numberOfLines={2}
                        color={colors.text.secondary} // EDIT
                    >
                        {card.label}
                    </Text>
                    <Text preset="h3">{card.value}</Text>
                </View>
            ))}
        </>
    );
};

