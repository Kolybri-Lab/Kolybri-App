import { deepCopyObject } from "@/utils/json";
import Period from "../models/Period";
import { calculateWeightedAverageFromArray, createValidGradesArray } from "./averages";
import { badgesDataInjectedIntoGrades } from "./badges";
import { deepEqualExcept } from "./helpers";

export const sortGradesByDate = (grades) => {
    return grades
        .filter((grade) => grade.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const calculateStreak = (gradesArrayChronologicaly, periodCode, apiData) => {
    const periodObj = new Period(apiData[periodCode], periodCode);
    let gradesItered = [];
    let streakScores = periodObj.createReferentialStreakScore();
    let globalStreakScore = 0;

    for (const grade of gradesArrayChronologicaly) {
        if (gradesItered.length === 0) {
            grade.actionOnStreak = grade.data.grade >= 10 ? "up" : "nothing";

            if (grade.actionOnStreak === "up") {
                streakScores[periodCode][grade.codes.discipline] += 1;
                globalStreakScore += 1;
            }

            gradesItered.push(grade);
            continue;
        }

        const quantityOfGradesInDiscipline = gradesItered.filter(
            (g) => g.codes.discipline === grade.codes.discipline
        ).length;

        const oldGeneralAverage = calculateWeightedAverageFromArray(gradesItered);
        const oldDisciplineAverage = calculateWeightedAverageFromArray(
            gradesItered,
            grade.codes.discipline
        );

        gradesItered.push(grade);

        const newDisciplineAverage = calculateWeightedAverageFromArray(
            gradesItered,
            grade.codes.discipline
        );

        if (quantityOfGradesInDiscipline === 0) {
            if (newDisciplineAverage > oldGeneralAverage) {
                grade.actionOnStreak = "up";
                streakScores[periodCode][grade.codes.discipline] += 1;
                globalStreakScore += 1;
            } else {
                grade.actionOnStreak = "nothing";
            }
            continue;
        }

        if (newDisciplineAverage > oldDisciplineAverage) {
            grade.actionOnStreak = "up";
            streakScores[periodCode][grade.codes.discipline] += 1;
            globalStreakScore += 1;
        } else {
            grade.actionOnStreak = "nothing";
            globalStreakScore -= streakScores[periodCode][grade.codes.discipline];
            streakScores[periodCode][grade.codes.discipline] = 0;

            for (let g of gradesItered.filter(
                (g) => g.codes.discipline === grade.codes.discipline
            )) {
                if (g.actionOnStreak === "up") g.actionOnStreak = "previous up";
            }
        }
    }

    return {
        streakScores,
        globalStreakScore,
        gradesItered,
    };
};

export function streakDataInjectedIntoGrades(userGrades) {
    const result = deepCopyObject(userGrades);
    Object.entries(result).forEach(([periodKey, periodData]) => {
        const gradesSortedByDate = sortGradesByDate(
            createValidGradesArray(result, periodKey)
        );
        const streak = calculateStreak(gradesSortedByDate, periodKey, result);
        periodData.globalStreakScore = streak.globalStreakScore;

        const periodStreakScores = streak.streakScores?.[periodKey] || {};

        const periodDisciplines = periodData.groups.flatMap((group) =>
            group.isDisciplineGroup ? group.disciplines : [group]
        );

        periodDisciplines.forEach((discipline) => {
            discipline.streakCount = periodStreakScores[discipline.code] || 0;
        });
        streak.gradesItered.forEach((gradeData) => {
            const discipline = periodDisciplines.find(
                ({ code }) => code === gradeData.codes.discipline
            );

            if (!discipline) return;
            const gradeToUpdate = discipline.grades.find((g) =>
                deepEqualExcept(g, gradeData, ["actionOnStreak"])
            );
            if (gradeToUpdate) {
                gradeToUpdate.actionOnStreak = gradeData.actionOnStreak;
            }
        });
    });

    return badgesDataInjectedIntoGrades(result);
}
