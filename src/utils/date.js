import dayjs from "dayjs";

export function formatFrenchDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: "long", day: "2-digit", month: "long" };
    let formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(date);
    let [weekday, day, month] = formattedDate.split(" ");
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`;
}

export function addDaysToDateString(dateString, days) {
    let date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

export function getPreviousMonday(dateString) {
    let date = new Date(dateString);
    let day = date.getDay();

    if (day !== 1) {
        date.setDate(date.getDate() - ((day + 6) % 7));
    }

    return date.toISOString().split("T")[0];
}

export function getTodayDateString() {
    const date = new Date();
    return date.toISOString().split("T")[0];
}

export const formatShortDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

export const formatDate = (date, ab = "display") => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    if (ab === "ed") {
        return `${year}-${month}-${day}`;
    }

    if (ab === "full") {
        const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${dayName} ${dayNum}, ${year}, ${hours}:${minutes}`;
    }

    if (ab === "fullDate") {
        const days = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
        const months = [
            "jan",
            "fév",
            "mar",
            "avr",
            "mai",
            "juin",
            "juil",
            "août",
            "sept",
            "oct",
            "nov",
            "déc",
        ];
        const dayName = days[date.getDay()];
        const dayNum = date.getDate();
        const monthName = months[date.getMonth()];

        return `${dayName} ${dayNum} ${monthName}, ${year}`;
    }

    return `${day}/${month}/${year}`;
};
export const isInDateInterval = (dateToTestInDateRange, startDate, endDate) => {
    const regexDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // "2026-12-15T10:56"
    const regexDate = /^\d{4}-\d{2}-\d{2}$/; // "2026-12-15"

    const isDateTimeFormat =
        regexDateTime.test(dateToTestInDateRange) &&
        regexDateTime.test(startDate) &&
        regexDateTime.test(endDate);

    const isDateOnlyFormat =
        regexDate.test(dateToTestInDateRange) &&
        regexDate.test(startDate) &&
        regexDate.test(endDate);

    if (!isDateTimeFormat && !isDateOnlyFormat) {
        return null;
    }

    const date = dayjs(dateToTestInDateRange);
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return (
        (date.isSame(start) || date.isAfter(start)) &&
        (date.isSame(end) || date.isBefore(end))
    );
};

