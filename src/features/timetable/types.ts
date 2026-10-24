/** "YYYY-MM-DD HH:mm" (e.g. "2026-10-12 08:15") */
export type DateTimeString = string;
export type DateString = string; // YYYY-MM-DD
export type EntryType = "COURS" | "EVENEMENT" | "CONGE" | "PERMANENCE";
export type FormattedEntryType = "COURSE" | "EVENT" | "LEAVE" | "BREAK";
export type BreaksType = "LEAVE" | "BREAK";

export interface ApiTimetableEntry {
    /** 0 for holidays and free periods, negative for some events */
    id: number;
    text: string;
    matiere: string;
    codeMatiere: string;
    typeCours: EntryType;
    start_date: DateTimeString;
    end_date: DateTimeString;
    color: string;
    dispensable: boolean;
    dispense: number;
    prof: string;
    salle: string;
    classe: string;
    classeId: number;
    classeCode: string;
    evenementId: number;
    groupe: string;
    groupeCode: string;
    isFlexible: boolean;
    groupeId: number;
    icone: string;
    isModifie: boolean;
    contenuDeSeance: boolean;
    devoirAFaire: boolean;
    isAnnule: boolean;
}

interface Schedules {
    start: { date: string; time: string };
    end: { date: string; time: string };
    duration: { text: string; int: number };
}

export interface Course {
    id: number;
    libelle: string;
    teacher: string;
    room: string;
    schedules: Schedules;
    color: string;
    states: {
        edited: boolean;
        cancelled: boolean;
        dispensed: boolean;
    };
    type: FormattedEntryType;
    weekView?: {
        top: number; // 0-1 --> percentage
        height: number; // 0-1 --> percentage
    };
    dayView: {
        height: number;
    };
}

export interface Break {
    schedules: Schedules;
    type: BreaksType;
    dayView?: { height: number }; // absent for LEAVE
}
export interface DayInfos {
    firstHour: string;
    lastHour: string;
    totalCancelled: number;
    totalEdited: number;
    totalDispensed: number;
}
export interface Day {
    date: string;
    fullDate: string;
    infos: DayInfos | null; // null if any courses
    courses: Course[];
    breaks: Break[];
}

export interface Week {
    days: Day[];
    from: { date: string; time: string };
    to: { date: string; time: string };
}

export interface TimetableResolverParams {
    token: string;
    offset: number;
}

export type TimelineItem =
    | { kind: "course"; data: Course | Course[] }
    | { kind: "break"; data: Break };

export type FlatDay = Omit<Day, "courses" | "breaks"> & {
    items: TimelineItem[];
};

// ui

export type DayViewProps = {
    days: FlatDay[];
    dayIndex: number;
    setSelectedDate: (date: string) => void;
    day: FlatDay;
    extendForward?: () => void;
    extendBackward?: () => void;
};

