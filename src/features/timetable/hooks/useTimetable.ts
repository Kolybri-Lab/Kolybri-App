import type { Week } from "@/features/timetable";
import timetableResolver from "@/features/timetable/resolver/timetable";
import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

const DEFAULT_RANGE = { min: -1, max: 1 };

const countCourses = (w: Week) =>
    w.days.reduce((total, d) => total + d.courses.length, 0);

export function useTimetable(token: string) {
    const [range, setRange] = useState(DEFAULT_RANGE);

    const resetRange = useCallback(() => {
        setRange(DEFAULT_RANGE);
    }, []);

    const extendForward = useCallback(() => {
        setRange((r) => ({ ...r, max: r.max + 1 }));
    }, []);

    const extendBackward = useCallback(() => {
        setRange((r) => ({ ...r, min: r.min - 1 }));
    }, []);

    const offsets = useMemo(() => {
        const arr: number[] = [];
        for (let i = range.min; i <= range.max; i++) arr.push(i);
        return arr;
    }, [range.min, range.max]);

    const queries = useQueries({
        queries: offsets.map((offset) => ({
            queryKey: ["timetable", token, offset] as const,
            queryFn: () => timetableResolver({ token, offset }) as Promise<Week[]>,
            enabled: Boolean(token),
        })),
    });

    const dataUpdatedAtKey = queries.map((q) => q.dataUpdatedAt).join(",");

    const allWeeks = useMemo(() => {
        const weeks = queries.flatMap((q) => q.data ?? []);

        // Doublon de semaine (même lundi) : on garde celle qui contient le plus de cours
        const byFrom = new Map<string, Week>();
        for (const w of weeks) {
            const existing = byFrom.get(w.from.date);
            if (!existing || countCourses(w) > countCourses(existing)) {
                byFrom.set(w.from.date, w);
            }
        }

        return [...byFrom.values()].sort((a, b) =>
            a.from.date.localeCompare(b.from.date)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdatedAtKey, token]);

    return {
        data: allWeeks,
        extendForward,
        extendBackward,
        resetRange,
        isLoading: queries.some((q) => q.isLoading),
        isError: queries.some((q) => q.isError),
        range,
    };
}

