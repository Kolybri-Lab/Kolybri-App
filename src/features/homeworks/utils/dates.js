import { formatFrenchDate } from "@/utils/date";

export function extractDates(homeworks) {
    const evaluationsDates = [];
    Object.entries(homeworks).map(([date, value]) => {
        value.forEach(({ interrogation }) => {
            if (interrogation) evaluationsDates.push(date);
        });
    });

    const countMap = new Map();
    evaluationsDates.forEach((date) => {
        countMap.set(date, (countMap.get(date) || 0) + 1);
    });

    const sortedDates = Object.keys(homeworks).sort((a, b) => a.localeCompare(b));

    return Object.fromEntries(
        sortedDates.map((date) => {
            const frenchDate = formatFrenchDate(date);
            const contractedDate = [
                frenchDate.charAt(0).toLowerCase() + frenchDate.slice(1, 3),
                frenchDate.split(" ")[1],
            ];
            return [
                date,
                {
                    long: frenchDate,
                    contracted: contractedDate,
                    isEvaluation: evaluationsDates.includes(date),
                    totalEvaluations: countMap.get(date),
                    allTasksCompleted: false,
                },
            ];
        })
    );
}
