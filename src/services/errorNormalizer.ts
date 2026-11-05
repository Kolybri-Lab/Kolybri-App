import { AppError } from "@/types";

function normalizeApiError(rawError: any): AppError | null {
    const code = rawError.code;

    if (code === 250) {
        return null;
    }

    if (code === 505 || code === 522) {
        return {
            type: "auth",
            reason: "invalid_credentials",
            code,
            message: rawError.message || "Identifiants invalides",
        };
    }

    if (code === 520 || code === 525) {
        return {
            type: "auth",
            reason: "session_expired",
            code,
            message: rawError.message || "Session expirée",
        };
    }

    return {
        type: "api-business",
        code,
        message: rawError.message || "Erreur du serveur École Directe",
    };
}

function normalizeNetworkError(rawError: any): AppError {
    return {
        type: "network",
        message: "Connexion Internet interrompue",
        isRetryable: true,
        originalError: rawError,
    };
}

function createUnknownError(message?: string, rawError?: any): AppError {
    return {
        type: "unknown",
        message: message || "Une erreur inattendue est survenue",
        originalError: rawError,
    };
}

export function errorNormalizer(rawError: any): AppError | null {
    if (!rawError) {
        return createUnknownError("Une erreur inconnue est survenue");
    }

    if (typeof rawError.code === "number") {
        return normalizeApiError(rawError);
    }

    if (rawError.isNetworkError) {
        return normalizeNetworkError(rawError);
    }

    return createUnknownError(rawError.message, rawError);
}

