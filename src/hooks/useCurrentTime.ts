import { useEffect, useState } from "react";

export interface CurrentDateTime {
    time: string;
    date: string;
    frenchDate: string;
}

const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

const formatFrenchDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
    };
    const formatted = new Intl.DateTimeFormat("fr-FR", options).format(date);
    const [weekday, day, month] = formatted.split(" ");
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`;
};

const getCurrentDateTime = (date: Date): CurrentDateTime => {
    return {
        time: formatTime(date),
        date: formatDate(date),
        frenchDate: formatFrenchDate(date),
    };
};

export function useCurrentTime(): CurrentDateTime {
    const [currentDateTime, setCurrentDateTime] = useState<CurrentDateTime>(() =>
        getCurrentDateTime(new Date())
    );

    useEffect(() => {
        const updateTime = () => {
            setCurrentDateTime(getCurrentDateTime(new Date()));
        };

        const now = new Date();
        const delayToNextMinute =
            (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        let intervalId: ReturnType<typeof setInterval> | undefined;
        const timeoutId = setTimeout(() => {
            updateTime();
            intervalId = setInterval(updateTime, 60000);
        }, delayToNextMinute);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return currentDateTime;
}

