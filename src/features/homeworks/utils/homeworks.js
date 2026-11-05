import { formatDate, formatFrenchDate } from "@/utils/date";
import base64Handler from "@/utils/handleBase64";

/**
 * Extrait le texte brut dépouillé de toute balise HTML, image, style et retour à la ligne
 */
export function extractPlainText(rawContent, isCustom = false) {
    if (!rawContent) return "";

    let text = rawContent;
    if (!isCustom) {
        try {
            text = base64Handler.decode(rawContent);
        } catch {
            text = rawContent;
        }
    }

    return text
        // Remplacer les balises de bloc et sauts par un simple espace
        .replace(/<br\s*[\/]?>/gi, " ")
        .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
        // Supprimer toutes les balises HTML restantes (images, styles, balises fermantes/ouvrantes)
        .replace(/<[^>]*>/g, "")
        // Décoder les entités HTML fréquentes
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&[a-z0-9#]+;/gi, "")
        // Nettoyer tous les espaces multiples et retours à la ligne en un seul espace continu
        .replace(/\s+/g, " ")
        .trim();
}

export function createHomework(raw) {
    let isDone = "todo";
    if (raw.isDone === true || raw.isDone === "done") {
        isDone = "done";
    }

    const rawContent = raw.homeworksContent?.content;
    let renderHtml = "";
    if (raw.isCustom) {
        renderHtml = rawContent || "";
    } else if (rawContent?.trim()) {
        try {
            renderHtml = base64Handler.decode(rawContent);
        } catch {
            renderHtml = rawContent;
        }
    }

    const plainText = extractPlainText(rawContent, raw.isCustom);

    return {
        courseContent: raw.courseContent,
        discipline: raw.discipline,
        givenOn: raw.givenOn || formatDate(new Date(), "ed"),
        homeworksContent: {
            ...raw.homeworksContent,
            renderHtml,
        },
        plainText,
        id: raw.id ?? null,
        isDone,
        loadingState: raw.loadingState || "idle",
        isEvaluation: raw.isEvaluation,
        returnOnline: raw.returnOnline ?? null,
        student: raw.student ?? null,
        customHomeworkMd5Key: raw.customHomeworkMd5Key ?? null,
        isCustom: raw.isCustom ?? false,
        date: raw.date,
        decodedHTMLCourseContent: "",
        decodedHTMLHomework: renderHtml,
    };
}

export function decodeHomeworkContent(homework) {
    const renderHtml = homework.homeworksContent?.content?.trim()
        ? base64Handler.decode(homework.homeworksContent.content)
        : "";

    return {
        ...homework,
        decodedHTMLCourseContent: homework.courseContent?.trim()
            ? base64Handler.decode(homework.courseContent)
            : "",
        decodedHTMLHomework: renderHtml,
        homeworksContent: {
            ...homework.homeworksContent,
            renderHtml,
        },
    };
}

export function serializeHomework(homework) {
    if (!homework.isCustom) return homework;
    return {
        ...homework,
        homeworksContent: {
            content: homework.homeworksContent.content,
            renderHtml: homework.homeworksContent?.renderHtml || homework.homeworksContent?.content || "",
            joinedDocuments: [],
        },
        plainText: homework.plainText || homework.homeworksContent?.content || "",
    };
}

export const assignUnit = (size) => {
    const absNombre = Math.abs(size);
    if (absNombre >= 1000000) {
        return (size / 1000000).toFixed(2).replace(/\.?0+$/, "") + " Mo";
    } else if (absNombre >= 1000) {
        return (size / 1000).toFixed(2).replace(/\.?0+$/, "") + " ko";
    } else {
        return size.toString();
    }
};

export function injectHomeworksIntoModel(model = {}, homeworksList = []) {
    const next = { ...model };
    const formatedDates = { ...(model.formatedDates ?? {}) };

    for (const homework of homeworksList) {
        const { date } = homework;
        if (!date) continue;

        const existing = next[date] ?? [];
        next[date] = [...existing, homework];

        const dayHomeworks = next[date];
        const totalEvaluations = dayHomeworks.filter((h) => h.isEvaluation).length;
        const allTasksCompleted = dayHomeworks.every((h) => h.isDone === "done");

        formatedDates[date] = {
            allTasksCompleted,
            isEvaluation: totalEvaluations > 0,
            totalEvaluations,
            long: formatedDates[date]?.long ?? formatFrenchDate(date),
            contracted: formatedDates[date]?.contracted ?? formatFrenchDate(date),
        };
    }

    next.formatedDates = formatedDates;
    return next;
}

