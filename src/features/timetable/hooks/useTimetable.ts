import type { Week } from "@/features/timetable";
import timetableResolver from "@/features/timetable/resolver/timetable";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useUserStore } from "@/hooks/useUserStore";
import { useQueries } from "@tanstack/react-query";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useCallback, useEffect, useMemo, useState } from "react";

dayjs.extend(isoWeek);

const DEFAULT_RANGE = { min: -1, max: 1 };

const countCourses = (w: Week) =>
    w.days.reduce((total, d) => total + d.courses.length, 0);

export function useTimetable(token?: string, selectedDate?: string) {
    const [range, setRange] = useState(DEFAULT_RANGE);

    const storeUserId = useUserStore((state) => state.profile?.id);
    const storeToken = useUserStore((state) => state.token);
    const isBooting = useAuthStore((state) => state.isBooting);

    const activeUserId = storeUserId;
    const activeToken = token || storeToken;

    const { date: todayDate } = useCurrentTime();

    const baseMonday = useMemo(() => {
        return dayjs(todayDate || undefined).startOf("isoWeek").format("YYYY-MM-DD");
    }, [todayDate]);

    // Si selectedDate pointe loin en avant ou en arrière, étendre range pour l'englober
    useEffect(() => {
        if (!selectedDate || !baseMonday) return;
        const targetMonday = dayjs(selectedDate).startOf("isoWeek");
        const diffWeeks = Math.round(
            targetMonday.diff(dayjs(baseMonday), "week", true)
        );
        setRange((r) => {
            let newMin = r.min;
            let newMax = r.max;
            if (diffWeeks < r.min) newMin = diffWeeks - 1;
            if (diffWeeks > r.max) newMax = diffWeeks + 1;
            if (newMin !== r.min || newMax !== r.max) {
                return { min: newMin, max: newMax };
            }
            return r;
        });
    }, [selectedDate, baseMonday]);

    const resetRange = useCallback(() => {
        setRange(DEFAULT_RANGE);
    }, []);

    const weekMondays = useMemo(() => {
        const arr: string[] = [];
        for (let i = range.min; i <= range.max; i++) {
            arr.push(dayjs(baseMonday).add(i * 7, "day").format("YYYY-MM-DD"));
        }
        return arr;
    }, [baseMonday, range.min, range.max]);

    const isEnabled = Boolean(activeUserId && activeToken && !isBooting);

    const queries = useQueries({
        queries: weekMondays.map((mondayDate) => ({
            queryKey: ["timetable", activeUserId, mondayDate] as const,
            queryFn: () =>
                timetableResolver({
                    mondayDate,
                    token: activeToken ?? undefined,
                }) as Promise<Week[]>,
            enabled: isEnabled,
        })),
    });

    const firstQueryLoading = Boolean(
        queries[0]?.isLoading || queries[0]?.isFetching
    );
    const lastQueryLoading = Boolean(
        queries[queries.length - 1]?.isLoading ||
            queries[queries.length - 1]?.isFetching
    );

    const extendForward = useCallback(() => {
        if (lastQueryLoading) return;
        setRange((r) => ({ ...r, max: r.max + 1 }));
    }, [lastQueryLoading]);

    const extendBackward = useCallback(() => {
        if (firstQueryLoading) return;
        setRange((r) => ({ ...r, min: r.min - 1 }));
    }, [firstQueryLoading]);

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
    }, [dataUpdatedAtKey]);

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
