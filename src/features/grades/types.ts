export interface ApiGrade {
    codeMatiere: string;
    codePeriode: string;
    devoir: string;
    libelleMatiere: string;
    date: string;
    coef: string;
    noteSur: string;
    valeur: string;
    nonSignificatif: boolean;
    moyenneClasse: string;
    minClasse: string;
    maxClasse: string;
    elementsProgramme: Array<{
        descriptif: string;
        valeur: number;
        libelleCompetence: string;
    }>;
    typeDevoir: string;
}

export interface ApiDiscipline {
    codeMatiere: string;
    discipline: string;
    moyenneClasse: string;
    moyenneMin: string;
    moyenneMax: string;
    coef: number;
    groupeMatiere: boolean;
    sousMatiere: boolean;
    effectif: number;
    rang: number;
    professeurs?: Array<{ nom: string }>;
    appreciationClasse?: string;
    appreciations?: string[];
}

export interface ApiPeriod {
    annuel: boolean;
    codePeriode: string;
    periode: string;
    ensembleMatieres: { disciplines: ApiDiscipline[] };
    dateDebut: string;
    dateFin: string;
    cloture: boolean;
}

export interface ApiGradesResponse {
    periodes: ApiPeriod[];
    notes: ApiGrade[];
}

export interface GradeAverageDatas {
    classAverage: number | null;
    minAverage: number | null;
    maxAverage: number | null;
    userAverage: number | null;
}

export interface FormattedGrade {
    libelle: string;
    notSignificant: boolean;
    date: string;
    isExam: boolean;
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
    actionOnStreak?: "up" | "down" | "equal" | "nothing" | "previous up";
    badges: string[];
    isSimulation?: boolean;
}

export interface FormattedDiscipline {
    code: string;
    libelle: string;
    color?: string;
    averageDatas: GradeAverageDatas;
    coef: number;
    isDisciplineGroup: boolean;
    isSubDisciplines: boolean;
    workforce: number;
    rank: number;
    teachers?: string[][];
    grades: FormattedGrade[];
    streakCount?: number;
}

export interface FormattedDisciplineGroup extends FormattedDiscipline {
    disciplines: FormattedDiscipline[];
    disciplineCodes: string[];
}

export interface FormattedPeriod {
    periodName: string;
    globalStreakScore?: number;
    groups: (FormattedDiscipline | FormattedDisciplineGroup)[];
}
export interface PeriodInfos {
    periodName: "string";
    periodCode: "string";
}

export interface LastGrade {
    libelle: string;
    date: string;
    disciplineName: string;
    disciplineColor?: string;
    codes: { period: string; discipline: string };
    data: {
        coef: number;
        outOf: number | null;
        grade: number | null;
    };
}

export type ResolvedGrades = Record<string, FormattedPeriod> & {
    lastGrades?: LastGrade[];
};

export interface SimulatedGrade {
    id: string;
    disciplineCode: string;
    periodCode: string;
    libelle: string;
    grade: number;
    outOf: number;
    coef: number;
    isSimulation: true;
}

export interface BestGradeProps {
    size?: number;
    width?: number | string;
    height?: number | string;
    color?: string;
    fill?: string;
}

export type SimpleFlammeProps = BestGradeProps;


