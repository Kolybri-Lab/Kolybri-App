import { parseNumber } from "../utils/averages";
import { objectsEqual } from "@/utils/json";
import Discipline from "./Discipline";
import Grade from "./Grade";
import { FormattedDiscipline, FormattedDisciplineGroup, FormattedPeriod, FormattedGrade } from "../types";

export default class Period {
    groups: (FormattedDiscipline | FormattedDisciplineGroup)[];
    periodCode: string;
    globalStreakScore: number | null;
    periodName: string | null;

    constructor(
        data?: { groups?: (FormattedDiscipline | FormattedDisciplineGroup)[]; globalStreakScore?: number | null; periodName?: string | null } | null,
        periodCode: string = ""
    ) {
        const safeData = data || {};
        this.groups = safeData.groups || [];
        this.periodCode = periodCode;
        this.globalStreakScore = safeData.globalStreakScore !== undefined ? safeData.globalStreakScore : null;
        this.periodName = safeData.periodName !== undefined ? safeData.periodName : null;
    }

    makeGeneralAverage(): number | null {
        const disciplines = this.groups.flatMap((group) =>
            (group as FormattedDisciplineGroup).isDisciplineGroup
                ? (group as FormattedDisciplineGroup).disciplines || []
                : [group as FormattedDiscipline]
        );

        let totalWeighted = 0;
        let totalCoef = 0;
        let sumSimpleAverage = 0;
        let countValidDisciplines = 0;

        disciplines.forEach((discipline) => {
            const disciplineObj = new Discipline(discipline);
            const calculatedAvg = disciplineObj.getWeightedAverage();
            const average =
                calculatedAvg !== null && calculatedAvg !== undefined
                    ? calculatedAvg
                    : discipline.averageDatas?.userAverage;

            if (average !== null && average !== undefined && !isNaN(average)) {
                const rawCoef = discipline.coef;
                const coef =
                    typeof rawCoef === "number" && !isNaN(rawCoef)
                        ? rawCoef
                        : 1;

                if (coef > 0) {
                    totalWeighted += average * coef;
                    totalCoef += coef;
                }

                sumSimpleAverage += average;
                countValidDisciplines += 1;
            }
        });

        if (totalCoef > 0) {
            return parseNumber(totalWeighted / totalCoef);
        }

        if (countValidDisciplines > 0) {
            return parseNumber(sumSimpleAverage / countValidDisciplines);
        }

        return null;
    }

    makeDisciplineAverage(disciplineCode: string): number | null {
        let disciplineSearched: FormattedDiscipline | null = null;

        for (const group of this.groups) {
            const disciplines = (group as FormattedDisciplineGroup).isDisciplineGroup
                ? (group as FormattedDisciplineGroup).disciplines
                : [group as FormattedDiscipline];

            const found = disciplines.find((d) => d.code === disciplineCode);
            if (found) {
                disciplineSearched = found;
                break;
            }
        }

        if (!disciplineSearched) {
            return null;
        }

        const discipline = new Discipline(disciplineSearched);
        const calculatedAvg = discipline.getWeightedAverage();
        return calculatedAvg !== null && calculatedAvg !== undefined
            ? calculatedAvg
            : disciplineSearched.averageDatas?.userAverage;
    }

    createReferentialStreakScore(): Record<string, Record<string, number>> {
        const ref: Record<string, Record<string, number>> = {};
        const disciplines = this.groups.flatMap((group) =>
            (group as FormattedDisciplineGroup).isDisciplineGroup ? (group as FormattedDisciplineGroup).disciplines : [group as FormattedDiscipline]
        );
        ref[this.periodCode] = {};

        disciplines.forEach(({ code }) => {
            ref[this.periodCode][code] = 0;
        });

        return ref;
    }

    getPeriodDatas() {
        let infos = {
            numberOfGroups: 0,
            numberOfDisciplines: 0,
        };
        this.groups.forEach((group) => {
            if ((group as FormattedDisciplineGroup).isDisciplineGroup) {
                infos.numberOfGroups++;
                infos.numberOfDisciplines += (group as FormattedDisciplineGroup).disciplines.length;
            } else {
                infos.numberOfDisciplines += 1;
            }
        });

        return {
            periodCode: this.periodCode,
            generalAverage: this.makeGeneralAverage(),
            ...infos,
        };
    }

    injectGrade(rawGrade: FormattedGrade) {
        const grade = new Grade(rawGrade);
        const periodDisciplines = this.groups.flatMap((group) =>
            (group as FormattedDisciplineGroup).isDisciplineGroup ? (group as FormattedDisciplineGroup).disciplines : [group as FormattedDiscipline]
        );

        const discipline = periodDisciplines.find(
            ({ code }) => code === grade.codes.discipline
        );

        if (!discipline) {
            console.warn(
                `"${grade.codes.discipline}" not found in ${this.periodCode}`
            );
            return false;
        }

        if (!Array.isArray(discipline.grades)) {
            discipline.grades = [];
        }

        discipline.grades.push(grade.getGrade());
        const disciplineObj = new Discipline(discipline);
        const calculatedAvg = disciplineObj.getWeightedAverage();
        discipline.averageDatas = {
            ...discipline.averageDatas,
            userAverage:
                calculatedAvg !== null && calculatedAvg !== undefined
                    ? calculatedAvg
                    : discipline.averageDatas?.userAverage,
        };
        return true;
    }

    removeGrade(rawGrade: FormattedGrade) {
        const grade = new Grade(rawGrade);

        const periodDisciplines = this.groups.flatMap((group) =>
            (group as FormattedDisciplineGroup).isDisciplineGroup ? (group as FormattedDisciplineGroup).disciplines : [group as FormattedDiscipline]
        );

        const discipline = periodDisciplines.find(
            ({ code }) => code === grade.codes.discipline
        );

        if (!discipline) return;

        if (!Array.isArray(discipline.grades) || discipline.grades.length === 0) {
            console.warn(`Any grade to delete for ${discipline.code}`);
        }
        const initialLength = discipline.grades.length;
        const gradeObj = grade.getGrade();
        discipline.grades = discipline.grades.filter(
            (g) => !objectsEqual(new Grade(g).getGrade(), gradeObj)
        );

        const disciplineObj = new Discipline(discipline);
        const calculatedAvg = disciplineObj.getWeightedAverage();
        discipline.averageDatas = {
            ...discipline.averageDatas,
            userAverage:
                calculatedAvg !== null && calculatedAvg !== undefined
                    ? calculatedAvg
                    : discipline.averageDatas?.userAverage,
        };

        if (discipline.grades.length === initialLength) {
            console.warn(
                `Any grades for "${grade.disciplineName}" was found for ${discipline.code}`
            );
        }
    }
}
