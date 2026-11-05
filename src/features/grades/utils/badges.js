import { deepCopyObject } from "@/utils/json";

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
                if (!grade) return;

                if (gradeObj.actionOnStreak === "up") badges.push("up_the_streak");
                if (grade === outOf) badges.push("max_grade");
                if (grade === classMax) badges.push("best_grade");
                if (grade > classAverage) badges.push("upper_than_class_average");
                if (currentDisciplineAverage && grade > currentDisciplineAverage)
                    badges.push("upper_than_discipline_average");
                if (grade === currentDisciplineAverage)
                    badges.push("equal_to_discipline_average");

                gradeObj.badges = badges;
            });
        });
    });
    return result;
}
