import { create } from "zustand";
import { AppError, EnrichedAppError } from "@/types/errors";

interface ErrorStoreState {
    errors: EnrichedAppError[];
    hasStaleData: boolean;
    pushError: (
        error: AppError,
        options?: { durationMs?: number | null; hasStaleData?: boolean }
    ) => string | null;
    dismissError: (id: string) => void;
    clearAuthErrors: () => void;
    clearNetworkErrors: () => void;
    setHasStaleData: (hasStaleData: boolean) => void;
    clearAll: () => void;
}

const DEDUPLICATION_WINDOW_MS = 10000;

export const useErrorStore = create<ErrorStoreState>((set, get) => ({
    errors: [],
    hasStaleData: false,

    pushError: (error, options) => {
        const now = Date.now();
        const currentErrors = get().errors;

        const existingDuplicate = currentErrors.find((existing) => {
            const isSameTypeAndMessage =
                existing.error.type === error.type &&
                existing.error.message === error.message;
            const isRecent = now - existing.timestamp < DEDUPLICATION_WINDOW_MS;
            return isSameTypeAndMessage && isRecent;
        });

        if (existingDuplicate) {
            set((state) => ({
                errors: state.errors.map((e) =>
                    e.id === existingDuplicate.id ? { ...e, timestamp: now } : e
                ),
                hasStaleData: options?.hasStaleData ?? true,
            }));
            return existingDuplicate.id;
        }

        const id = `${error.type}_${now}_${Math.random().toString(36).substring(2, 9)}`;

        const defaultDuration =
            error.type === "network" || error.type === "auth"
                ? null
                : DEDUPLICATION_WINDOW_MS;

        const durationMs =
            options?.durationMs !== undefined ? options.durationMs : defaultDuration;

        const enrichedError: EnrichedAppError = {
            id,
            timestamp: now,
            durationMs,
            error,
        };

        set((state) => ({
            errors: [...state.errors, enrichedError],
            hasStaleData: options?.hasStaleData ?? true,
        }));

        return id;
    },

    dismissError: (id) => {
        set((state) => ({
            errors: state.errors.filter((e) => e.id !== id),
        }));
    },

    clearAuthErrors: () => {
        set((state) => ({
            errors: state.errors.filter((e) => e.error.type !== "auth"),
        }));
    },

    clearNetworkErrors: () => {
        set((state) => {
            const hasNetworkErrors = state.errors.some((e) => e.error.type === "network");
            if (!hasNetworkErrors && !state.hasStaleData) {
                return state;
            }
            return {
                errors: state.errors.filter((e) => e.error.type !== "network"),
                hasStaleData: false,
            };
        });
    },

    setHasStaleData: (hasStaleData) => {
        set({ hasStaleData });
    },

    clearAll: () => {
        set({ errors: [], hasStaleData: false });
    },
}));

