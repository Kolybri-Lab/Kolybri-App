import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import gradesResolver from "@/features/grades/resolver/grades";
import { useSubjectStore } from "@/hooks/useSubjectStore";
import { useTheme } from "@/hooks/useThemeStore";
import {
    FormattedDiscipline,
    FormattedDisciplineGroup,
    FormattedPeriod,
    ResolvedGrades,
} from "../types";

const remapGroup = (
    group: FormattedDiscipline | FormattedDisciplineGroup,
    resolve: (color: string | undefined, isDark: boolean) => string,
    isDark: boolean
): FormattedDiscipline | FormattedDisciplineGroup => {
    const nextColor = group.color ? resolve(group.color, isDark) : group.color;
    if ("disciplines" in group && Array.isArray(group.disciplines)) {
        return {
            ...group,
            color: nextColor,
            disciplines: group.disciplines.map((d) => ({
                ...d,
                color: d.color ? resolve(d.color, isDark) : d.color,
            })),
        };
    }
    return { ...group, color: nextColor };
};

export function useGrades(token: string) {
    const { isDark } = useTheme();
    const query = useQuery<ResolvedGrades>({
        queryKey: ["grades"],
        queryFn: () => gradesResolver(token) as Promise<ResolvedGrades>,
        enabled: Boolean(token),
    });

    const data = useMemo(() => {
        if (!query.data) return {} as ResolvedGrades;
        const resolve = useSubjectStore.getState().resolveColorForTheme;
        const next: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(query.data)) {
            if (key === "lastGrades" && Array.isArray(value)) {
                next.lastGrades = value.map((item) => ({
                    ...item,
                    disciplineColor: item.disciplineColor
                        ? resolve(item.disciplineColor, isDark)
                        : item.disciplineColor,
                }));
            } else if (value && typeof value === "object" && "groups" in value) {
                const period = value as FormattedPeriod;
                next[key] = {
                    ...period,
                    groups: period.groups.map((g) => remapGroup(g, resolve, isDark)),
                };
            } else {
                next[key] = value;
            }
        }

        return next as ResolvedGrades;
    }, [query.data, isDark]);

    return {
        ...query,
        data,
    };
}
