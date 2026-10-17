import { CONFIG } from "@/constants/config";
import { sortTimetable } from "@/features/timetable/utils/sort";
import fetchApi from "@/services/fetchApi";
import { FetchApiResponse } from "@/types";
import { addDaysToDateString, getPreviousMonday } from "@/utils/date";
import { ApiTimetableEntry, TimetableResolverParams, Week } from "../types";
import { fillHolidays } from "../utils/holidays";

export default async function timetableResolver({
    token,
    offset = 0,
}: TimetableResolverParams): Promise<Week[]> {
    const baseMonday = getPreviousMonday(CONFIG.dateNow);
    const requestedMonday = addDaysToDateString(baseMonday, offset * 7);

    const requestedSunday = addDaysToDateString(requestedMonday, 6);

    const timetableResponse = await fetchApi<FetchApiResponse<ApiTimetableEntry[]>>(
        `https://api.ecoledirecte.com/v3/E/{USER_ID}/emploidutemps.awp?verbe=get&{API_VERSION}`,
        {
            body: {
                dateDebut: requestedMonday,
                dateFin: requestedSunday,
                avecTrous: true,
            },
            headers: {
                "X-Token": token,
            },
            method: "POST",
        }
    );
    if (timetableResponse?.isDataEmpty) {
        return [];
    }

    return !timetableResponse
        ? (fillHolidays(requestedMonday, requestedSunday) as any)
        : sortTimetable(timetableResponse.data);
}

