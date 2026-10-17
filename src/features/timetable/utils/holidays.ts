import { formatFrenchDate } from "@/utils/date";
import dayjs from "dayjs";
import type { Break, Day } from "../types";

export const fillHolidays = (startDateStr: string, endDateStr: string): Day[] => {
  const days: Day[] = [];
  const end = dayjs(endDateStr);

  for (let d = dayjs(startDateStr); !d.isAfter(end, "day"); d = d.add(1, "day")) {
    const date = d.format("YYYY-MM-DD");

    const leave: Break = {
      type: "LEAVE",
      schedules: {
        start: { date, time: "00:00" },
        end: { date, time: "23:59" },
        duration: { text: "23:59", int: 23.983 },
      },
    };

    days.push({
      date,
      fullDate: formatFrenchDate(date),
      infos: null,
      courses: [],
      breaks: [leave],
    });
  }

  return days;
};