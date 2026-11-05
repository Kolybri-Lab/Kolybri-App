import { FormattedGrade } from "../types";

export default class Grade {
    libelle: string;
    notSignificant: boolean;
    date: string;
    homeworkType: string;
    disciplineName: string;
    codes: { period: string; discipline: string };
    data: {
        coef: number;
        classAverage: number | null;
        outOf: number | null;
        classMax: number | null;
        classMin: number | null;
        grade: number | null;
    };
    skills: Array<{ name: string; description: string; value: string | null }>;
    onlySkills: boolean;
    isExam: boolean;
    actionOnStreak: "up" | "down" | "equal" | "nothing" | "previous up";
    badges: string[];
    isSimulation: boolean;

    constructor(gradeData?: Partial<FormattedGrade> & { isSimulation?: boolean }) {
        const safeData = gradeData || {};
        this.libelle = safeData.libelle || "";
        this.notSignificant = safeData.notSignificant || false;
        this.date = safeData.date || "";
        this.homeworkType = safeData.homeworkType || "";
        this.disciplineName = safeData.disciplineName || "";
        this.codes = safeData.codes || { period: "", discipline: "" };
        this.data = safeData.data || {
            coef: 0,
            classAverage: null,
            outOf: null,
            classMax: null,
            classMin: null,
            grade: null,
        };
        this.skills = safeData.skills || [];
        this.onlySkills = safeData.onlySkills || false;
        this.isExam = safeData.isExam || false;
        this.actionOnStreak = safeData.actionOnStreak || "nothing";
        this.badges = safeData.badges || [];
        this.isSimulation = safeData.isSimulation || false;
    }

    getGrade(): FormattedGrade & { isSimulation: boolean } {
        return {
            libelle: this.libelle,
            notSignificant: this.notSignificant,
            date: this.date,
            isExam: this.isExam,
            homeworkType: this.homeworkType,
            disciplineName: this.disciplineName,
            codes: this.codes,
            data: this.data,
            skills: this.skills,
            onlySkills: this.onlySkills,
            actionOnStreak: this.actionOnStreak,
            badges: this.badges,
            isSimulation: this.isSimulation,
        };
    }
}
