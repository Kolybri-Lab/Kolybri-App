import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import gradesResolver from "@/features/grades/resolver/grades";
import {
    resolveStoreColorForTheme,
    useSubjectColorDependencies,
} from "@/services/query/subjectColors";
import { useAccountQueryContext } from "@/services/query/useAccountQuery";
import {
    FormattedDiscipline,
    FormattedDisciplineGroup,
    FormattedPeriod,
    ResolvedGrades,
} from "../types";

const remapGroup = (
    group: FormattedDiscipline | FormattedDisciplineGroup,
    isDark: boolean
): FormattedDiscipline | FormattedDisciplineGroup => {
    const nextColor = resolveStoreColorForTheme(group.color, isDark);
    if ("disciplines" in group && Array.isArray(group.disciplines)) {
        return {
            ...group,
            color: nextColor,
            disciplines: group.disciplines.map((d) => ({
                ...d,
                color: resolveStoreColorForTheme(d.color, isDark),
            })),
        };
    }
    return { ...group, color: nextColor };
};

export function useGrades(token?: string | null) {
    const { userId, token: activeToken, isEnabled, isRestoring } =
        useAccountQueryContext(token);
    const { isDark, officialVersion } = useSubjectColorDependencies();

    const query = useQuery<ResolvedGrades>({
        queryKey: ["grades", userId],
        queryFn: () => gradesResolver(activeToken!) as Promise<ResolvedGrades>,
        enabled: isEnabled,
    });

    const data = useMemo(() => {
        if (!query.data) return {} as ResolvedGrades;
        const next: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(query.data)) {
            if (key === "lastGrades" && Array.isArray(value)) {
                next.lastGrades = value.map((item) => ({
                    ...item,
                    disciplineColor: resolveStoreColorForTheme(
                        item.disciplineColor,
                        isDark
                    ),
                }));
            } else if (value && typeof value === "object" && "groups" in value) {
                const period = value as FormattedPeriod;
                next[key] = {
                    ...period,
                    groups: period.groups.map((g) => remapGroup(g, isDark)),
                };
            } else {
                next[key] = value;
            }
        }

        return next as ResolvedGrades;
    }, [query.data, isDark, officialVersion]);

    return {
        ...query,
        isLoading: query.isLoading || (isRestoring && query.data === undefined),
        data,
    };
}
