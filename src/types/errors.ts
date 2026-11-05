export interface NetworkAppError {
    type: "network";
    message: string;
    isRetryable: true;
    originalError?: unknown;
}

export interface ApiBusinessAppError {
    type: "api-business";
    code: number;
    message: string;
    feature?: string;
    isRetryable?: boolean;
}

export interface AuthAppError {
    type: "auth";
    reason: "invalid_credentials" | "session_expired";
    code: number;
    message: string;
}

export interface UnknownAppError {
    type: "unknown";
    message: string;
    endpoint?: string;
    originalError?: unknown;
}

export type AppError =
    NetworkAppError | ApiBusinessAppError | AuthAppError | UnknownAppError;

export interface EnrichedAppError {
    id: string;
    timestamp: number;
    durationMs?: number | null;
    error: AppError;
}

