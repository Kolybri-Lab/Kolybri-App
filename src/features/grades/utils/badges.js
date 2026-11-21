import { deepCopyObject } from "@/utils/json";
import { parseNumber } from "./averages";

export function badgesDataInjectedIntoGrades(userGrades) {
    const result = deepCopyObject(userGrades);

    Object.values(result).forEach((periodData) => {
        const periodDisciplines = periodData.groups.flatMap((group) =>
            group.isDisciplineGroup ? group.disciplines : [group]
        );

        periodDisciplines.forEach((discipline) => {
            const currentDisciplineAverage = discipline.averageDatas.userAverage;

            discipline.grades.forEach((gradeObj) => {
                const { classAverage, classMax, outOf, grade } =
                    gradeObj?.data || {};
                const badges = [];
                if (grade == null) return;

                const normalizedGrade =
                    outOf > 0 ? parseNumber((grade / outOf) * 20) : null;

                if (gradeObj.actionOnStreak === "up") badges.push("up_the_streak");
                if (outOf != null && grade === outOf) badges.push("max_grade");
                if (classMax != null && grade === classMax) badges.push("best_grade");
                if (classAverage != null && grade > classAverage)
                    badges.push("upper_than_class_average");
                if (
                    currentDisciplineAverage != null &&
                    normalizedGrade != null &&
                    normalizedGrade > currentDisciplineAverage
                )
                    badges.push("upper_than_discipline_average");
                if (
                    currentDisciplineAverage != null &&
                    normalizedGrade != null &&
                    normalizedGrade === currentDisciplineAverage
                )
                    badges.push("equal_to_discipline_average");

                gradeObj.badges = badges;
            });
        });
    });
    return result;
}
