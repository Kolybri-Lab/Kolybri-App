export const toMilliseconds = (hours, minutes) => {
    if (typeof hours === "string") [hours, minutes] = hours.split(":");
    return parseInt(hours) * 3600000 + parseInt(minutes) * 60000;
};

export const toHoursMinutes = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return [hours, minutes];
};

export const getTimeInterval = (
    textInitDate /* YYYY-MM-DDTHH:MM */,
    textDestDate /* YYYY-MM-DDTHH:MM */
) => {
    // CONVERT TO MINUTES !

    const [initDate, initTime] = textInitDate.split("T");
    const [destDate, destTime] = textDestDate.split("T");

    const [initYYYY, initMM, initDD] = initDate.split("-").map(Number);
    const [destYYYY, destMM, destDD] = destDate.split("-").map(Number);

    const [iDateYYYY, iDateMM, iDateDD] = [
        destYYYY - initYYYY,
        destMM - initMM,
        destDD - initDD,
    ];

    const dateInterval = (iDateYYYY + iDateMM + iDateDD) * 1440; // mn

    const [initHH, initMm] = initTime.split(":").map(Number);
    const [destHH, destMm] = destTime.split(":").map(Number);

    const [iTimeHH, iTimeMm] = [destHH - initHH, destMm - initMm];

    const timeInterval = iTimeHH * 60 + iTimeMm;
    const interval = dateInterval + timeInterval;

    let [intervalDays, intervalHours, intervalMinutes] = [
        0,
        Math.floor(interval / 60),
        interval % 60,
    ];

    if (Math.abs(intervalHours) >= 24) {
        let days = Math.round(intervalHours / 24);
        intervalDays = days;
    }

    return [intervalDays, intervalHours, intervalMinutes];
};
export const convertTimeHoursMinToMinutes = (...time) => {
    return time.map((t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    });
};

export const isBefore = (t1, t2) => {
    const [minutesT1, minutesT2] = convertTimeHoursMinToMinutes(t1, t2);
    if (minutesT1 <= minutesT2) return true;
    else return false;
};
export const isAfter = (t1, t2) => {
    const [minutesT1, minutesT2] = convertTimeHoursMinToMinutes(t1, t2);
    if (minutesT1 >= minutesT2) return true;
    else return false;
};

export const isInInterval = (time, timeStart, timeEnd) => {
    if (isAfter(time, timeStart) && isBefore(time, timeEnd)) {
        return true;
    } else {
        return false;
    }
};

export const formatDuration = ([days, hours, minutes], pattern = "normal") => {
    if (pattern === "short") {
        if (days === 0 && hours === 0) {
            return `${minutes}min`;
        }
        if (days > 0) {
            if (days > 4) {
                return `+${days}j`;
            }
            return `${days}j${hours}h${minutes}`;
        }
        if (hours > 4) {
            return `+${hours}h`;
        }
        return `${hours}h${minutes}`;
    }
    if (days === 0 && hours === 0) {
        return `${minutes} min`;
    }
    if (days > 0) {
        if (days > 4) {
            return `plus de ${days} jours`;
        }
        return `${days}j ${hours}h ${minutes}min`;
    }
    if (hours > 4) {
        return `plus de ${hours} heures`;
    }
    return `${hours}h ${minutes}min`;
};
