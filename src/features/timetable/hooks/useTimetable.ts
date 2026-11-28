import type { Week } from "@/features/timetable";
import timetableResolver from "@/features/timetable/resolver/timetable";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import {
    getStoreSubjectColor,
    useSubjectColorDependencies,
} from "@/services/query/subjectColors";
import { useAccountQueryContext } from "@/services/query/useAccountQuery";
import { onlineManager, useQueries } from "@tanstack/react-query";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useCallback, useEffect, useMemo, useState } from "react";

dayjs.extend(isoWeek);

const DEFAULT_RANGE = { min: -1, max: 1 };

const countCourses = (w: Week) =>
    w.days.reduce((total, d) => total + d.courses.length, 0);

export function useTimetable(token?: string | null, selectedDate?: string) {
    const [range, setRange] = useState(DEFAULT_RANGE);
    const { isDark, officialVersion } = useSubjectColorDependencies();
    const {
        userId: activeUserId,
        token: activeToken,
        isEnabled,
        isRestoring,
    } = useAccountQueryContext(token);

    const { date: todayDate } = useCurrentTime();

    const baseMonday = useMemo(() => {
        return dayjs(todayDate || undefined)
            .startOf("isoWeek")
            .format("YYYY-MM-DD");
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
            arr.push(
                dayjs(baseMonday)
                    .add(i * 7, "day")
                    .format("YYYY-MM-DD")
            );
        }
        return arr;
    }, [baseMonday, range.min, range.max]);

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

    const firstQueryBusy = Boolean(
        !isEnabled ||
        queries[0]?.isPending ||
        queries[0]?.isFetching
    );
    const lastQueryBusy = Boolean(
        !isEnabled ||
        queries[queries.length - 1]?.isPending ||
        queries[queries.length - 1]?.isFetching
    );

    const extendForward = useCallback(() => {
        if (lastQueryBusy || !onlineManager.isOnline()) return;
        setRange((r) => ({ ...r, max: r.max + 1 }));
    }, [lastQueryBusy]);

    const extendBackward = useCallback(() => {
        if (firstQueryBusy || !onlineManager.isOnline()) return;
        setRange((r) => ({ ...r, min: r.min - 1 }));
    }, [firstQueryBusy]);

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

        return [...byFrom.values()]
            .sort((a, b) => a.from.date.localeCompare(b.from.date))
            .map((week) => ({
                ...week,
                days: week.days.map((day) => ({
                    ...day,
                    courses: day.courses.map((course) => ({
                        ...course,
                        color: getStoreSubjectColor(course.codeMatiere),
                    })),
                })),
            }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataUpdatedAtKey, isDark, officialVersion]);

    return {
        data: allWeeks,
        extendForward,
        extendBackward,
        resetRange,
        isLoading:
            queries.some((q) => q.isLoading) ||
            (isRestoring && allWeeks.length === 0),
        isError: queries.some((q) => q.isError),
        range,
    };
}

