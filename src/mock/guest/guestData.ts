import { useAuthStore } from "@/hooks/useAuthStore";
import { useErrorStore } from "@/hooks/useErrorStore";
import authService from "@/services/login/authService";
import storeDatas from "@/services/login/tools/storeLoginDatas";
import dayjs from "dayjs";

import { GUEST_CREDENTIALS } from "@/constants/config";
import {
    mockGrades,
    mockHomeworks,
    mockLogin,
    mockMessageDetail,
    mockMessagesFolder,
    mockMessagesReceivedPage1,
    mockMessagesReceivedPage2,
    mockMessagesReceivedPage3,
    mockTimetable,
} from "./json";

interface GuestOverrides {
    timetableEmpty: boolean;
    gradesEmpty: boolean;
    homeworksEmpty: boolean;
    activeTestCourse: boolean;
    hiddenCurrentCourse: boolean;
}

let guestOverrides: GuestOverrides = {
    timetableEmpty: false,
    gradesEmpty: false,
    homeworksEmpty: false,
    activeTestCourse: false,
    hiddenCurrentCourse: false,
};

export const getGuestOverrides = () => guestOverrides;

export const setGuestTimetableEmpty = (empty: boolean) => {
    guestOverrides.timetableEmpty = empty;
};

export const resetGuestTimetable = () => {
    guestOverrides.timetableEmpty = false;
    guestOverrides.activeTestCourse = false;
    guestOverrides.hiddenCurrentCourse = false;
};

export const toggleGuestActiveCourse = () => {
    if (guestOverrides.activeTestCourse) {
        guestOverrides.activeTestCourse = false;
        return;
    }
    if (guestOverrides.hiddenCurrentCourse) {
        guestOverrides.hiddenCurrentCourse = false;
        return;
    }

    const now = dayjs();
    const nowStr = now.format("YYYY-MM-DD HH:mm");
    const rawShifted = getShiftedTimetable();
    const courses = rawShifted.data || [];
    const hasActiveNow = courses.some((c: any) => {
        return (
            c.start_date &&
            c.end_date &&
            c.start_date <= nowStr &&
            c.end_date >= nowStr &&
            !c.isTestCourse
        );
    });

    if (hasActiveNow) {
        guestOverrides.hiddenCurrentCourse = true;
    } else {
        guestOverrides.activeTestCourse = true;
    }
};

export const setGuestGradesEmpty = (empty: boolean) => {
    guestOverrides.gradesEmpty = empty;
};

export const resetGuestGrades = () => {
    guestOverrides.gradesEmpty = false;
};

export const setGuestHomeworksEmpty = (empty: boolean) => {
    guestOverrides.homeworksEmpty = empty;
};

export const resetGuestHomeworks = () => {
    guestOverrides.homeworksEmpty = false;
};

export const resetAllGuestTests = () => {
    guestOverrides = {
        timetableEmpty: false,
        gradesEmpty: false,
        homeworksEmpty: false,
        activeTestCourse: false,
        hiddenCurrentCourse: false,
    };
};

export const getGuestData = (url: string, body?: any): any => {
    const messageDetailMatch = url.match(/\/messages\/(\d+)\.awp/);
    const dateRegex = /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;
    const pageMatch = url.match(/[?&]page=(\d+)/);
    const requestedPage = pageMatch ? Number(pageMatch[1]) : 0;

    if (url.includes("/notes.awp")) {
        if (guestOverrides.gradesEmpty) {
            return {
                code: 200,
                token: "guest_token",
                host: "HTTP200",
                data: {
                    notes: [],
                    periodes: [],
                    parametres: {},
                },
            };
        }
        return mockGrades;
    }

    if (url.includes("/emploidutemps.awp")) {
        return getShiftedTimetable(body?.dateDebut);
    }

    if (url.includes("verbe=put") || url.includes("/cahierdetexte.awp?verbe=put")) {
        return handleToggleHomework(body);
    }
    const dateMatch = url.match(dateRegex);
    if (url.includes("/cahierdetexte/") && dateMatch) {
        return getGuestHomeworksForDate(dateMatch[0]);
    }
    if (url.includes("/cahierdetexte.awp")) {
        if (guestOverrides.homeworksEmpty) {
            return {
                code: 200,
                token: "guest_token",
                host: "HTTP200",
                data: {},
            };
        }
        return mockHomeworks;
    }

    if (url.includes("/messages.awp")) {
        if (
            url.includes("typeRecuperation=classeur") &&
            url.includes("idClasseur=564")
        ) {
            return mockMessagesFolder;
        }
        if (requestedPage === 1) {
            return mockMessagesReceivedPage2;
        }
        if (requestedPage >= 2) {
            return mockMessagesReceivedPage3;
        }
        return mockMessagesReceivedPage1;
    }

    // (messages/{messageId}.awp)
    if (messageDetailMatch) {
        const messageId = messageDetailMatch[1];
        if (messageId === "103040") {
            return mockMessageDetail;
        }
        return getGenericMessageDetail(messageId);
    }

    return null;
};

const getGuestHomeworksForDate = (date: string) => {
    if (guestOverrides.homeworksEmpty) {
        return {
            code: 200,
            token: "guest_token",
            host: "HTTP200",
            data: { date, matieres: [] },
        };
    }

    const dayHomeworks = mockHomeworks?.data?.[date] || [];

    const matieres = dayHomeworks.map((hw: any) => ({
        entityCode: "1",
        entityLibelle: "Classe Invité",
        entityType: "C",
        matiere: hw.matiere,
        codeMatiere: hw.codeMatiere,
        nomProf: "M. Professeur",
        id: hw.idDevoir,
        interrogation: hw.interrogation ?? false,
        blogActif: false,
        nbJourMaxRenduDevoir: 0,
        aFaire: {
            idDevoir: hw.idDevoir,
            contenu:
                "Vm9pY2kgbGUgdHJhdmFpbCDDoCBmYWlyZSwgaWwgZXN0IHRyw6hzIGRyw7RsZQ==",
            rendreEnLigne: hw.rendreEnLigne ?? false,
            donneLe: hw.donneLe || date,
            effectue: hw.effectue ?? false,
            ressource: "",
            documentsRendusDeposes: false,
            ressourceDocuments: [],
            documents: hw.documentsAFaire
                ? [
                      {
                          id: 1000 + hw.idDevoir,
                          libelle: `Consignes_${hw.matiere}.pdf`,
                          type: "PDF",
                          taille: 1048576,
                      },
                  ]
                : [],
            commentaires: [],
            elementsProg: [],
            liensManuel: [],
            documentsRendus: [],
            contenuDeSeance: {
                contenu: "Vm9pY2kgbGUgdHJhdmFpbCBlZmZlY3R1w6kgYXVqb3VyZCdodWk=",
                documents: [],
                commentaires: [],
            },
        },
    }));

    return {
        code: 200,
        token: "guest_token",
        host: "HTTP200",
        data: {
            date,
            matieres,
        },
    };
};

const handleToggleHomework = (body?: any) => {
    const doneIds = (body?.idDevoirsEffectues || []).map(Number);
    const notDoneIds = (body?.idDevoirsNonEffectues || []).map(Number);

    if (doneIds.length > 0 || notDoneIds.length > 0) {
        // Mettre à jour la liste globale (mockHomeworks)
        if (mockHomeworks?.data) {
            Object.values(mockHomeworks.data).forEach((dayHomeworks: any) => {
                if (Array.isArray(dayHomeworks)) {
                    dayHomeworks.forEach((hk: any) => {
                        const ids = [hk.id, hk.idDevoir]
                            .filter((x) => x != null)
                            .map(Number);
                        if (ids.some((id) => doneIds.includes(id))) {
                            hk.effectue = true;
                        }
                        if (ids.some((id) => notDoneIds.includes(id))) {
                            hk.effectue = false;
                        }
                    });
                }
            });
        }
    }

    return {
        code: 200,
        token: "guest_token",
        host: "HTTP200",
        message: "",
        data: {},
    };
};

const getGenericMessageDetail = (messageId: string | number) => {
    const foundMsg =
        mockMessagesReceivedPage1?.data?.messages?.received?.find(
            (m: any) => String(m.id) === String(messageId)
        ) ||
        mockMessagesFolder?.data?.messages?.received?.find(
            (m: any) => String(m.id) === String(messageId)
        ) ||
        mockMessagesReceivedPage2?.data?.messages?.received?.find(
            (m: any) => String(m.id) === String(messageId)
        ) ||
        mockMessagesReceivedPage3?.data?.messages?.received?.find(
            (m: any) => String(m.id) === String(messageId)
        );

    return {
        code: 200,
        token: "guest_token",
        host: "HTTP200",
        message: "",
        data: {
            id: Number(messageId),
            mtype: foundMsg?.mtype || "received",
            read: true,
            idDossier: foundMsg?.idDossier ?? -1,
            idClasseur: foundMsg?.idClasseur ?? 0,
            transferred: foundMsg?.transferred ?? false,
            answered: foundMsg?.answered ?? false,
            to_cc_cci: foundMsg?.to_cc_cci || "to",
            brouillon: foundMsg?.brouillon ?? false,
            subject: foundMsg?.subject || "Message de test",
            // Base64-encoded: "Bonjour,\n\nCeci est un message de test générique pour le mode invité.\n\nCordialement."
            content:
                "Qm9uam91ciwKCkNlY2kgZXN0IHVuIG1lc3NhZ2UgZGUgdGVzdCBnw6luw6lyaXF1ZSBwb3VyIGxlIG1vZGUgaW52aXTDqS4KCkNvcmRpYWxlbWVudC4=",
            date: foundMsg?.date || "2026-06-22 10:00:00",
            to: [],
            files: [],
            from: foundMsg?.from || {
                nom: "EDP",
                prenom: "Support",
                civilite: "",
                role: "A",
                id: 999,
            },
        },
    };
};

const getShiftedTimetable = (requestedMonday?: string) => {
    if (guestOverrides.timetableEmpty) {
        return {
            ...mockTimetable,
            data: [],
        };
    }

    const courses = mockTimetable.data || [];
    const firstCourse = courses.find((c: any) => c.start_date);
    if (!firstCourse) return mockTimetable;

    const mockFirstDate = dayjs(firstCourse.start_date.split(" ")[0]);
    const mockDayOfWeek = mockFirstDate.day();
    const daysToSubtract = mockDayOfWeek === 0 ? 6 : mockDayOfWeek - 1;
    const mockMonday = mockFirstDate.subtract(daysToSubtract, "day");

    const reqMonday = requestedMonday
        ? dayjs(requestedMonday)
        : dayjs().startOf("week").add(1, "day");
    const diffInDays = reqMonday.diff(mockMonday, "day");

    let shiftedCourses = courses.map((course: any) => {
        if (!course.start_date || !course.end_date) return course;

        const start = dayjs(course.start_date);
        const end = dayjs(course.end_date);

        return {
            ...course,
            start_date: start.add(diffInDays, "day").format("YYYY-MM-DD HH:mm"),
            end_date: end.add(diffInDays, "day").format("YYYY-MM-DD HH:mm"),
        };
    });

    const todayStr = dayjs().format("YYYY-MM-DD");
    const now = dayjs();
    const nowTimeStr = now.format("YYYY-MM-DD HH:mm");

    if (guestOverrides.hiddenCurrentCourse) {
        shiftedCourses = shiftedCourses.map((c: any) => {
            if (
                c.start_date &&
                c.end_date &&
                c.start_date <= nowTimeStr &&
                c.end_date >= nowTimeStr &&
                !c.isTestCourse
            ) {
                return {
                    ...c,
                    end_date: now.subtract(1, "minute").format("YYYY-MM-DD HH:mm"),
                };
            }
            return c;
        });
    }

    if (guestOverrides.activeTestCourse) {
        const todayNextCourses = shiftedCourses
            .filter(
                (c: any) =>
                    c.start_date &&
                    c.start_date.startsWith(todayStr) &&
                    c.start_date > nowTimeStr
            )
            .sort((a: any, b: any) => a.start_date.localeCompare(b.start_date));

        const nextCourse = todayNextCourses[0];
        const testStartTime = now.subtract(15, "minute").format("YYYY-MM-DD HH:mm");
        const testEndTime = nextCourse
            ? nextCourse.start_date
            : now.add(45, "minute").format("YYYY-MM-DD HH:mm");

        const testCourse = {
            id: 99999,
            text: "TEST",
            matiere: "TEST",
            codeMatiere: "TEST",
            typeCours: "COURS",
            start_date: testStartTime,
            end_date: testEndTime,
            color: "#3b82f6",
            dispensable: false,
            dispense: 0,
            prof: "M. TEST",
            salle: "Salle TEST",
            classe: "TEST",
            classeId: 999,
            classeCode: "TEST",
            evenementId: 0,
            groupe: " ",
            groupeCode: "",
            isFlexible: false,
            groupeId: 0,
            icone: "",
            isModifie: false,
            contenuDeSeance: false,
            devoirAFaire: false,
            isAnnule: false,
            isTestCourse: true,
        };

        shiftedCourses = [...shiftedCourses, testCourse];
    }

    return {
        ...mockTimetable,
        data: shiftedCourses,
    };
};

export const loginAsGuest = async (keepConnected: boolean = true) => {
    useErrorStore.getState().clearAll();
    const accountData = mockLogin?.data?.accounts?.[0] || {
        id: 7875,
        typeCompte: "E",
        prenom: "Invité",
        nom: "Démo",
        email: "guest@ecoledirecteplus.fr",
        nomEtablissement: "Établissement Invité",
        profile: {
            sexe: "M",
            telPortable: "0600000000",
            classe: {
                libelle: "Classe Invité",
                code: "GUEST",
            },
        },
    };

    console.log("Bienvenue dans le compte développeur");

    if (keepConnected) {
        await authService.saveCredentials("guest_token", accountData.id, {
            identifiant: GUEST_CREDENTIALS.username,
            motdepasse: GUEST_CREDENTIALS.password,
        });
    }

    storeDatas({ data: accountData, token: "guest_token" });
    useAuthStore.getState().setAuthenticated(true);
    useAuthStore.getState().setBooting(false);
};
