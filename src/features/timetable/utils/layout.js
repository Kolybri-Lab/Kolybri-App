import { CONFIG } from "@/constants/config";
import { useColorStore } from "@/hooks/useColorStore";
import { isDarkColor } from "@/utils/colorGenerator";
import { formatFrenchDate } from "@/utils/date";
import { toMilliseconds } from "@/utils/time";
import makeUniqueIds from "@/utils/uniqueIds";

export const convertData = (arrayData = []) => {
    const convertedTimetable = [];
    const finalTimetable = {};
    const ids = makeUniqueIds(arrayData.map((course) => course.id));

    arrayData.forEach((element, indexElement) => {
        const {
            text,
            start_date,
            end_date,
            prof,
            salle,
            classe,
            groupe,
            dispense,
            isModifie,
            isAnnule,
            codeMatiere,
        } = element;

        const converter = {
            webId: ids[indexElement],
            isEdited: isModifie,
            isCancelled: isAnnule,
            isDispensed: Boolean(dispense),
            startCourse: {
                date: start_date.split(" ")[0],
                time: start_date.split(" ")[1],
            },
            endCourse: {
                date: end_date.split(" ")[0],
                time: end_date.split(" ")[1],
            },
            teacher: prof && prof.trim() === "" ? undefined : prof,
            room: salle && salle.trim() === "" ? undefined : salle,
            classGroup: classe && classe.trim() === "" ? undefined : classe,
            group: groupe && groupe.trim() === "" ? undefined : groupe,
            libelle: text.toUpperCase() || "Sans nom",
            codeMatiere: codeMatiere || text,
        };

        convertedTimetable.push(converter);
    });
    convertedTimetable.forEach((course) => {
        const day = course.startCourse.date;
        if (!finalTimetable[day]) {
            finalTimetable[day] = [];
        }
        const colorKey = course.codeMatiere || course.libelle;
        const color = useColorStore.getState().getOrAssignColor(colorKey);
        course["color"] = color;
        course["textColor"] = isDarkColor(color)
            ? "hsl(0, 100%, 100%)"
            : "hsl(0, 0%, 0%)";

        finalTimetable[day].push(course);
    });

    Object.keys(finalTimetable).forEach((date) => {
        finalTimetable[date].sort((a, b) => {
            const [ah, am] = a.startCourse.time.split(":").map(Number);
            const [bh, bm] = b.startCourse.time.split(":").map(Number);
            return ah * 60 + am - (bh * 60 + bm);
        });
    });

    const sortedDays = Object.keys(finalTimetable).sort(
        (a, b) => new Date(a) - new Date(b)
    );

    return sortedDays.map((day) => ({
        date: day,
        courses: finalTimetable[day],
    }));
};

export function getTimePercentage(time, startDayTime, interval) {
    const [hours, minutes] = time.split(":").map(Number);
    const msTime = hours * 3600000 + minutes * 60000;
    return (((msTime - startDayTime) / interval) * 100).toFixed(2);
}

export function sizeTimetable(timetableData = []) {
    const hours = {};
    const maxTime = [];
    const minTime = [];

    timetableData.forEach((data, index) => {
        const startTimes = data.courses.map((course) =>
            toMilliseconds(course.startCourse.time)
        );
        const endTimes = data.courses.map((course) =>
            toMilliseconds(course.endCourse.time)
        );

        const first = Math.min(...startTimes);
        const last = Math.max(...endTimes);
        const interval = last - first;

        hours[data.date] = { first, last, interval };
        first !== 0 ? minTime.push(first) : null;

        timetableData[index]["isJustNoon"] = last <= CONFIG.middleNoonCourseTime;

        maxTime.push(last);
    });

    timetableData.forEach((data, index) => {
        data.courses.forEach((course, i) => {
            const startMs = toMilliseconds(course.startCourse.time);
            const endMs = toMilliseconds(course.endCourse.time);

            const placing = getTimePercentage(
                course.startCourse.time,
                hours[data.date].first,
                hours[data.date].interval
            );

            const height = ((endMs - startMs) / hours[data.date].interval) * 100;

            timetableData[index].courses[i].height = timetableData[index].isJustNoon
                ? height / 2.5
                : height;
            timetableData[index].courses[i].placing = timetableData[index].isJustNoon
                ? placing / 2.5
                : placing;
        });
    });
    return timetableData;
}

export const otherEdits = (timetableData = []) => {
    timetableData.forEach((_, index) => {
        timetableData[index]["iSODate"] = formatFrenchDate(
            timetableData[index].date
        );
    });

    return timetableData;
};

export const sortedTimetable = async (timetable) => {
    const newTimetable = convertData(await timetable);
    const sizedTimetable = sizeTimetable(newTimetable);
    const finalSortedTimetable = otherEdits(sizedTimetable);

    return finalSortedTimetable;
};

