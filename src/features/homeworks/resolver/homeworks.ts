import { useColorStore } from "@/hooks/useColorStore";
import { createHomework } from "../utils/homeworks";
import { extractDates } from "../utils/dates";
import fetchApi from "@/services/fetchApi";
import { FetchApiResponse } from "@/types";
import {
    ResolvedHomeworks,
    ApiHomework,
    ApiHomeworksDetailsResponse,
} from "../types";

export default async function homeworksResolver({
    token,
}: {
    token: string;
}): Promise<ResolvedHomeworks | Record<string, never>> {
    const homeworksResponse = await fetchApi<FetchApiResponse<Record<string, any>>>(
        "https://api.ecoledirecte.com/v3/Eleves/{USER_ID}/cahierdetexte.awp?verbe=get&{API_VERSION}",
        { headers: { "X-Token": token }, method: "POST" }
    );
    if (!homeworksResponse || homeworksResponse.isDataEmpty) {
        return {};
    }
    const homeworks = homeworksResponse.data;
    const entries: [string, any][] = await Promise.all(
        Object.entries(homeworks).map(async ([date, value]) => {
            const details = await homeworksDetails({ date, token });
            const homework = details.disciplines.map((hk) =>
                createHomework({ ...hk, date })
            );

            return [date, homework] as [string, any];
        })
    );
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    return {
        ...Object.fromEntries(entries),
        formatedDates: extractDates(homeworks),
    } as ResolvedHomeworks;
}

export async function homeworksDetails({
    token,
    date,
}: {
    token: string;
    date: string;
}): Promise<{ date: string; disciplines: any[] }> {
    const homeworksDetailsResponse = await fetchApi<FetchApiResponse<ApiHomeworksDetailsResponse>>(
        `https://api.ecoledirecte.com/v3/Eleves/{USER_ID}/cahierdetexte/${date}.awp?verbe=get&{API_VERSION}`,
        { headers: { "X-Token": token }, method: "POST" }
    );

    if (!homeworksDetailsResponse || homeworksDetailsResponse.isDataEmpty) {
        return { date, disciplines: [] };
    }

    const homeworks = homeworksDetailsResponse.data;

    return {
        date: homeworks.date,
        disciplines: (homeworks.matieres || [])
            .filter((m) => m.aFaire !== undefined)
            .map((homework) => formatHomeworksDetails(homework, date)),
    };
}

function formatHomeworksDetails(
    grade: ApiHomework,
    date: string
) {
    const {
        entityCode,
        entityLibelle,
        matiere,
        codeMatiere,
        nomProf,
        id,
        interrogation,
        aFaire,
        contenuDeSeance,
    } = grade;

    const DEFAULT_BASE64_MESSAGE =
        "PHA+Vm91cyBuJ2F2ZXogcGFzIGRlIGNvbnRlbnUgZGUgc8OpYW5jZTwvcD4=";

    const hkContent = aFaire?.contenuDeSeance?.contenu;
    const seanceContent = contenuDeSeance?.contenu;

    let courseContent = DEFAULT_BASE64_MESSAGE;

    if (typeof hkContent === "string" && hkContent.trim() !== "") {
        courseContent = hkContent;
    } else if (typeof seanceContent === "string" && seanceContent.trim() !== "") {
        courseContent = seanceContent;
    }

    return {
        discipline: {
            name: matiere,
            code: codeMatiere,
            teacher: nomProf,
            color: useColorStore.getState().getOrAssignColor(codeMatiere),
        },
        student: {
            class: entityLibelle,
            classCode: entityCode,
        },
        id,
        isEvaluation: interrogation,
        isDone: aFaire?.effectue,
        returnOnline: aFaire?.rendreEnLigne,
        givenOn: aFaire?.donneLe,
        homeworksContent: {
            content: aFaire?.contenu,
            joinedDocuments: aFaire?.documents,
        },
        courseContent: courseContent,
    };
}

export async function toggleHomeworkInApi({
    token,
    id,
    state,
}: {
    token: string;
    id: number;
    state: boolean;
}): Promise<void> {
    const body = {
        ...(state && {
            idDevoirsEffectues: [id],
        }),
        ...(!state && { idDevoirsNonEffectues: [id] }),
    };
    return await fetchApi(
        `https://api.ecoledirecte.com/v3/Eleves/{USER_ID}/cahierdetexte.awp?verbe=put&{API_VERSION}`,
        {
            body,
            headers: { "X-Token": token },
            method: "POST",
        }
    );
}
