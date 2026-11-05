import { sortTimetable } from "@/features/timetable/utils/sort";
import fetchApi from "@/services/fetchApi";
import { FetchApiResponse } from "@/types";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { ApiTimetableEntry, TimetableResolverParams, Week } from "../types";
import { fillHolidays } from "../utils/holidays";

dayjs.extend(isoWeek);

export default async function timetableResolver({
    mondayDate,
    token,
}: TimetableResolverParams): Promise<Week[]> {
    const requestedMonday = dayjs(mondayDate).startOf("isoWeek").format("YYYY-MM-DD");
    const requestedSunday = dayjs(requestedMonday).add(6, "day").format("YYYY-MM-DD");

    const timetableResponse = await fetchApi<FetchApiResponse<ApiTimetableEntry[]>>(
        `https://api.ecoledirecte.com/v3/E/{USER_ID}/emploidutemps.awp?verbe=get&{API_VERSION}`,
        {
            body: {
                dateDebut: requestedMonday,
                dateFin: requestedSunday,
                avecTrous: true,
            },
            headers: token ? { "X-Token": token } : undefined,
            method: "POST",
        }
    );

    if (timetableResponse?.isDataEmpty || !timetableResponse?.data) {
        return [
            {
                from: { date: requestedMonday, time: "00:00" },
                to: { date: requestedSunday, time: "23:59" },
                days: fillHolidays(requestedMonday, requestedSunday),
            },
        ];
    }

    return sortTimetable(timetableResponse.data, requestedMonday, requestedSunday);
}
