interface BaseTech {
    appVersion: string;
    modelInfo?: string;
    osInfo?: string;
    screenInfo?: string;
    theme?: string;
}

interface BaseForm {
    category: "Général" | "Style" | "Fonctionnalités" | "Bug";
    title: string;
    message: string;
    tech: BaseTech;
}

interface ErrorReport {
    type: "error";
    form: BaseForm & {
        stackTrace?: string;
        errorCode?: string;
    };
}

interface FeedbackReport {
    type: "feedback";
    form: BaseForm & {
        rating?: number;
    };
}

export type ReportOptions = ErrorReport | FeedbackReport;
