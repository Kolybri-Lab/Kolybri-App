export const calculateStrengthsWeaknesses = (currentPeriod = {}, topCount = 3) => {
    const strengths = Array.from({ length: topCount }, () => undefined);
    const weaknesses = Array.from({ length: topCount }, () => undefined);

    if (!currentPeriod.groups) {
        return {
            strengths: [],
            weaknesses: [],
        };
    }

    const subjectsForCurrentPeriod = currentPeriod.groups.flatMap((group) =>
        group.isDisciplineGroup ? group.disciplines : [group]
    );

    subjectsForCurrentPeriod.forEach((subject) => {
        if (!subject.averageDatas) return;

        const algebricDiff =
            subject.averageDatas.userAverage - subject.averageDatas.classAverage;

        for (let i = 0; i < strengths.length; i++) {
            const current = strengths[i];
            if (current === undefined || algebricDiff >= current.algebricDiff) {
                strengths.splice(i, 0, { algebricDiff, subject });
                strengths.splice(strengths.length - 1, 1);
                break;
            }
        }

        for (let i = 0; i < weaknesses.length; i++) {
            const current = weaknesses[i];
            if (current === undefined || algebricDiff <= current.algebricDiff) {
                weaknesses.splice(i, 0, { algebricDiff, subject });
                weaknesses.splice(weaknesses.length - 1, 1);
                break;
            }
        }
    });

    return {
        strengths: strengths.filter((s) => s !== undefined),
        weaknesses: weaknesses.filter((w) => w !== undefined),
    };
};

export const deepEqualExcept = (obj1, obj2, excludedKeys = []) => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return obj1 === obj2;
    if (typeof obj1 !== typeof obj2) return false;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        return obj1.every((el, i) => deepEqualExcept(el, obj2[i], excludedKeys));
    }

    if (typeof obj1 === "object") {
        const keys1 = Object.keys(obj1).filter((k) => !excludedKeys.includes(k));
        const keys2 = Object.keys(obj2).filter((k) => !excludedKeys.includes(k));

        if (keys1.length !== keys2.length) return false;

        return keys1.every((k) => deepEqualExcept(obj1[k], obj2[k], excludedKeys));
    }

    return obj1 === obj2;
};

export const formatGradeText = (gradeInt = 0.0, extraNumbers = 2) => {
    try {
        const grade = parseFloat(gradeInt);
        if (isNaN(grade)) {
            return "N.No";
        }

        if (extraNumbers === "auto") {
            return String(grade).replace(".", ",");
        } else {
            return grade.toFixed(extraNumbers).replace(".", ",");
        }
    } catch (e) {
        return "N.No";
    }
};

