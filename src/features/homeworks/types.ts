export interface HomeworkDiscipline {
    name: string;
    code?: string;
    teacher?: string;
    color?: string;
    textColor?: string;
}

export interface HomeworkContent {
    content: string | null;
    renderHtml?: string;
    joinedDocuments: any[];
}

export interface Homework {
    id: number;
    date: string;
    discipline: HomeworkDiscipline;
    homeworksContent: HomeworkContent;
    plainText: string;
    isDone: "done" | "todo";
    loadingState?: "idle" | "loading" | "error";
    isEvaluation: boolean;
    isCustom: boolean;
    givenOn: string;
    returnOnline: boolean | null;
    student: { class: string; classCode: string } | null;
    courseContent: string | null;
    decodedHTMLCourseContent: string;
    decodedHTMLHomework: string;
    customHomeworkMd5Key: string | null;
}

export interface FormattedDate {
    long: string;
    contracted: [string, string];
    isEvaluation: boolean;
    totalEvaluations?: number;
    allTasksCompleted: boolean;
}

export type ResolvedHomeworks = Record<string, Homework[]> & {
    formatedDates: Record<string, FormattedDate>;
};

export interface ApiHomework {
    entityCode: string;
    entityLibelle: string;
    entityType: string;
    matiere: string;
    codeMatiere: string;
    nomProf: string;
    id: number;
    interrogation: boolean;
    blogActif?: boolean;
    nbJourMaxRenduDevoir?: number;
    aFaire?: {
        contenu?: string;
        documents?: any[];
        effectue: boolean;
        rendreEnLigne: boolean | null;
        donneLe: string;
        contenuDeSeance?: {
            contenu?: string;
        };
    };
    contenuDeSeance?: {
        contenu?: string;
    };
}

export interface ApiHomeworksDetailsResponse {
    date: string;
    matieres: ApiHomework[];
}
