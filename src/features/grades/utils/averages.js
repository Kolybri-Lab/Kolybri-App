export function parseNumber(value) {
    if (typeof value === "number") {
        if (isNaN(value)) return null;
        return Math.round(value * 100) / 100;
    }
    if (typeof value === "string") {
        const parsed = parseFloat(value.replace(",", "."));
        if (isNaN(parsed)) return null;
        return Math.round(parsed * 100) / 100;
    }
    return null;
}

export const createValidGradesArray = (gradesData, periodCode) => {
    if (!gradesData[periodCode]?.groups) return [];

    const disciplines = gradesData[periodCode].groups.flatMap((group) =>
        group.isDisciplineGroup ? group.disciplines : [group]
    );

    const gradesArray = disciplines.flatMap((discipline) =>
        Array.isArray(discipline.grades)
            ? discipline.grades.filter((grade) => {
                  const data = grade.data || {};
                  const gradeValue = data.grade;
                  const coef = data.coef;
                  const outOf = data.outOf;

                  return (
                      !grade.notSignificant &&
                      !grade.onlySkills &&
                      gradeValue !== "" &&
                      gradeValue !== null &&
                      !isNaN(gradeValue) &&
                      coef !== 0 &&
                      coef !== "" &&
                      !isNaN(coef) &&
                      outOf !== 0 &&
                      outOf !== "" &&
                      !isNaN(outOf)
                  );
              })
            : []
    );

    return gradesArray;
};

export const calculateWeightedAverageFromArray = (grades, disciplineCode = null) => {
    if (!Array.isArray(grades) || grades.length === 0) return null;

    const { total, totalCoef } = grades.reduce(
        (acc, grade) => {
            if (disciplineCode && grade.codes?.discipline !== disciplineCode)
                return acc;

            const value = (grade.data?.grade / grade.data?.outOf) * 20;
            const coef = grade.data?.coef;

            if (
                value !== null &&
                value !== "" &&
                !isNaN(value) &&
                coef !== null &&
                coef !== "" &&
                !isNaN(coef)
            ) {
                acc.total += value * coef;
                acc.totalCoef += coef;
            }

            return acc;
        },
        { total: 0, totalCoef: 0 }
    );

    return totalCoef > 0 ? parseNumber(total / totalCoef) : null;
};
