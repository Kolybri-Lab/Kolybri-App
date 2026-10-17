import timetableResolver from "@/features/timetable/resolver/timetable";
import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Day } from "../types";

export function useTimetable(token: string) {
    const [range, setRange] = useState({ min: -1, max: 1 });

    const resetRange = useCallback(() => {
        setRange({ min: -1, max: 1 });
    }, []);

    const offsets = useMemo(() => {
        const arr: number[] = [];
        for (let i = range.min; i <= range.max; i++) arr.push(i);
        return arr;
    }, [range.min, range.max]);

    const queries = useQueries({
        queries: offsets.map((offset) => ({
            queryKey: ["timetable", offset] as const,
            queryFn: () => timetableResolver({ token, offset }) as Promise<Day[]>,
            enabled: Boolean(token),
        })),
    });

    const dataUpdatedAtKey = queries.map((q) => q.dataUpdatedAt).join(",");

    const allDays = useMemo(() => {
        const days = queries.flatMap((q) => q.data ?? []);
        const seen = new Set<string>();
        return days
            .filter((d) => {
                if (seen.has(d.date)) return false;
                seen.add(d.date);
                return true;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdatedAtKey]);

    return {
        data: allDays,
        resetRange,
        isLoading: queries.some((q) => q.isLoading),
        isError: queries.some((q) => q.isError),
        range,
    };
}

