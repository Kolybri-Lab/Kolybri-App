import { timetableConfig } from "@/constants/features/timetableConfig";
import { formatFrenchDate } from "@/utils/date";
import { round } from "@/utils/numbers";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type {
    ApiTimetableEntry,
    Break,
    Course,
    Day,
    DayInfos,
    FlatDay,
    FormattedEntryType,
    TimelineItem,
    Week,
} from "..";
import { useColorStore } from "@/hooks/useColorStore";

dayjs.extend(isoWeek);

const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const calculateDayInfos = (day: Day): DayInfos => {
    const firstHour = day.courses[0].schedules.start.time;
    const lastHour = day.courses.reduce(
        (max, c) => (c.schedules.end.time > max ? c.schedules.end.time : max),
        "00:00"
    );
    const stats = day.courses.reduce(
        (acc, c) => {
            if (c.states.cancelled) acc.totalCancelled++;
            if (c.states.edited && !c.states.cancelled) acc.totalEdited++;
            if (c.states.dispensed) acc.totalDispensed++;
            return acc;
        },
        { totalCancelled: 0, totalEdited: 0, totalDispensed: 0 }
    );

    return { ...stats, firstHour, lastHour };
};

const formatDuration = (
    startDate: string,
    endDate: string
): { text: string; int: number } => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const minutes = end.diff(start, "minute");
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const text = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    return { text, int: Math.round((h + m / 60) * 1000) / 1000 }; // XX,XXX
};

const formatCourse = (entry: ApiTimetableEntry, id: number): Course => {
    let type: FormattedEntryType;
    switch (entry.typeCours) {
        case "CONGE":
            type = "LEAVE";
            break;
        case "COURS":
            type = "COURSE";
            break;
        case "EVENEMENT":
            type = "EVENT";
            break;
        case "PERMANENCE":
            type = "BREAK";
            break;
    }
    return {
        id, // index
        color: useColorStore.getState().getOrAssignColor(entry.codeMatiere),
        libelle: entry.matiere?.trim() || entry.text?.trim() || "Cours sans titre",
        teacher: entry?.prof?.trim() || "Pas de prof",
        room: entry.salle?.trim() || "Aucune salle",
        schedules: {
            start: {
                date: entry.start_date.split(" ")[0],
                time: entry.start_date.split(" ")[1],
            },
            end: {
                date: entry.end_date.split(" ")[0],
                time: entry.end_date.split(" ")[1],
            },
            duration: formatDuration(entry.start_date, entry.end_date),
        },
        states: {
            cancelled: entry.isAnnule,
            dispensed: entry.dispensable,
            edited: entry.isModifie,
        },
        type,
        dayView: {
            height: Math.max(
                timetableConfig.minHeight,
                (Math.round(formatDuration(entry.start_date, entry.end_date).int) -
                    1) *
                    timetableConfig.pxPerHour +
                    timetableConfig.minHeight
            ),
        },
    };
};
const isBreak = (c: Course): c is Course & { type: "BREAK" | "LEAVE" } =>
    c.type === "BREAK" || c.type === "LEAVE";

const NOON_START = 11 * 60;
const NOON_END = 14 * 60;

export const isLunchBreak = (breakItem: Break): boolean => {
    const start = toMinutes(breakItem.schedules.start.time);
    const end = toMinutes(breakItem.schedules.end.time);
    return start >= NOON_START && end <= NOON_END;
};

const formatBreak = (entry: Course): Break => ({
    schedules: entry.schedules,
    type: entry.type as "BREAK" | "LEAVE",
    ...(entry.type === "BREAK" && {
        dayView: { height: timetableConfig.breakHeight },
    }),
});

const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const createBreak = (date: string, startMin: number, endMin: number): Break => {
    const startTime = toTimeString(startMin);
    const endTime = toTimeString(endMin);
    const startDateTime = `${date} ${startTime}`;
    const endDateTime = `${date} ${endTime}`;
    return {
        type: "BREAK",
        schedules: {
            start: { date, time: startTime },
            end: { date, time: endTime },
            duration: formatDuration(startDateTime, endDateTime),
        },
        dayView: { height: timetableConfig.breakHeight },
    };
};

const subtractCoursesFromBreak = (breakItem: Break, courses: Course[]): Break[] => {
    if (breakItem.type !== "BREAK") return [breakItem];

    const date = breakItem.schedules.start.date;
    const initialStart = toMinutes(breakItem.schedules.start.time);
    const initialEnd = toMinutes(breakItem.schedules.end.time);

    let freeIntervals: Array<{ start: number; end: number }> = [
        { start: initialStart, end: initialEnd },
    ];

    for (const course of courses) {
        if (course.states.cancelled) continue;

        const cStart = toMinutes(course.schedules.start.time);
        const cEnd = toMinutes(course.schedules.end.time);

        const nextIntervals: Array<{ start: number; end: number }> = [];

        for (const interval of freeIntervals) {
            if (cEnd <= interval.start || cStart >= interval.end) {
                nextIntervals.push(interval);
                continue;
            }

            if (cStart > interval.start) {
                nextIntervals.push({ start: interval.start, end: cStart });
            }

            if (cEnd < interval.end) {
                nextIntervals.push({ start: cEnd, end: interval.end });
            }
        }

        freeIntervals = nextIntervals;
    }

    return freeIntervals.map((inv) => createBreak(date, inv.start, inv.end));
};

const weekKey = (date: string) => {
    const d = dayjs(date);
    return `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, "0")}`;
};

export const sortTimetable = (data: ApiTimetableEntry[]): Week[] => {
    const courses = data
        .map(formatCourse)
        .sort((a, b) =>
            `${a.schedules.start.date} ${a.schedules.start.time}`.localeCompare(
                `${b.schedules.start.date} ${b.schedules.start.time}`
            )
        );

    const weeks = new Map<string, Week>();
    for (const course of courses) {
        const date = course.schedules.start.date;
        const key = weekKey(date);
        let week = weeks.get(key);
        if (!week) {
            const monday = dayjs(date).startOf("isoWeek");
            week = {
                from: {
                    date: monday.format("YYYY-MM-DD"),
                    time: "" /* calculated after */,
                },
                to: {
                    date: monday.add(6, "day").format("YYYY-MM-DD"),
                    time: "" /* calculated after */,
                },
                days: [],
            };
            weeks.set(key, week);
        }

        let day = week.days.find((d) => d.date === date);
        if (!day) {
            day = {
                date,
                fullDate: formatFrenchDate(date),
                courses: [],
                breaks: [],
                infos: null,
            };
            week.days.push(day);
        }

        if (isBreak(course)) {
            day.breaks.push(formatBreak(course));
        } else {
            day.courses.push(course);
        }
    }

    for (const week of weeks.values()) {
        const monday = dayjs(week.from.date);
        for (let i = 0; i < 7; i++) {
            const dateStr = monday.add(i, "day").format("YYYY-MM-DD");
            let day = week.days.find((d) => d.date === dateStr);
            if (!day) {
                day = {
                    date: dateStr,
                    fullDate: formatFrenchDate(dateStr),
                    courses: [],
                    breaks: [],
                    infos: null,
                };
                week.days.push(day);
            }
            if (day.courses.length === 0 && day.breaks.length === 0) {
                day.breaks.push({
                    type: "LEAVE",
                    schedules: {
                        start: { date: dateStr, time: "00:00" },
                        end: { date: dateStr, time: "23:59" },
                        duration: { text: "23:59", int: 23.983 },
                    },
                });
            }
        }
        week.days.sort((a, b) => a.date.localeCompare(b.date));
    }

    for (const week of weeks.values()) {
        let minHour = "99:99";
        let maxHour = "00:00";

        for (const day of week.days) {
            if (day.courses.length === 0) {
                day.breaks = day.breaks.filter((b) => b.type === "LEAVE");
                continue;
            }

            day.infos = calculateDayInfos(day);
            const { firstHour, lastHour } = day.infos;

            day.breaks = day.breaks
                .flatMap((b) => subtractCoursesFromBreak(b, day.courses))
                .filter(
                    (b) =>
                        b.type !== "LEAVE" &&
                        b.schedules.start.time >= firstHour &&
                        b.schedules.end.time <= lastHour &&
                        b.schedules.duration.int >
                            timetableConfig.breakMinMinutes / 60
                );

            if (firstHour < minHour) minHour = firstHour;
            if (lastHour > maxHour) maxHour = lastHour;
        }

        // week without courses, leave empty
        if (minHour !== "99:99") {
            week.from.time = minHour;
            week.to.time = maxHour;
            applyWeekViewPlacing(week);
        }
    }

    return [...weeks.values()];
};

const applyWeekViewPlacing = (week: Week) => {
    const min = toMinutes(week.from.time);
    const total = toMinutes(week.to.time) - min || 1; // avoid x/0 !

    for (const day of week.days) {
        for (const course of day.courses) {
            const start = toMinutes(course.schedules.start.time);
            const end = toMinutes(course.schedules.end.time);
            course.weekView = {
                top: round((start - min) / total, 4),
                height: round((end - start) / total, 4),
            };
        }
    }
};

const getItemStartTime = (item: TimelineItem): string => {
    if (item.kind === "break") return item.data.schedules.start.time;
    if (Array.isArray(item.data))
        return item.data[0]?.schedules.start.time ?? "00:00";
    return item.data.schedules.start.time;
};

const byStart = (a: TimelineItem, b: TimelineItem) =>
    getItemStartTime(a).localeCompare(getItemStartTime(b));

export const groupConcurrentCourses = (courses: Course[]): Course[][] => {
    if (courses.length === 0) return [];

    const sorted = [...courses].sort((a, b) =>
        a.schedules.start.time.localeCompare(b.schedules.start.time)
    );

    const groups: Course[][] = [];
    let currentGroup: Course[] = [sorted[0]];
    let currentGroupEnd = toMinutes(sorted[0].schedules.end.time);

    for (let i = 1; i < sorted.length; i++) {
        const course = sorted[i];
        const courseStart = toMinutes(course.schedules.start.time);
        const courseEnd = toMinutes(course.schedules.end.time);

        if (courseStart < currentGroupEnd) {
            currentGroup.push(course);
            if (courseEnd > currentGroupEnd) {
                currentGroupEnd = courseEnd;
            }
        } else {
            groups.push(currentGroup);
            currentGroup = [course];
            currentGroupEnd = courseEnd;
        }
    }
    groups.push(currentGroup);

    return groups;
};

export const flattenDays = (weeks: Week[]): FlatDay[] =>
    weeks.flatMap((week) =>
        week.days.map(({ courses, breaks, ...day }) => {
            const courseGroups = groupConcurrentCourses(courses);
            return {
                ...day,
                items: [
                    ...courseGroups.map((data): TimelineItem => ({
                        kind: "course",
                        data,
                    })),
                    ...breaks.map((data): TimelineItem => ({ kind: "break", data })),
                ].sort(byStart),
            };
        })
    );

