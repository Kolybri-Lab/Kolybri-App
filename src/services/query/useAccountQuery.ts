import { useAuthStore } from "@/hooks/useAuthStore";
import { useUserStore } from "@/hooks/useUserStore";
import { useIsRestoring } from "@tanstack/react-query";

export interface AccountQueryContext {
    userId: number | string | undefined;
    token: string | null;
    isBooting: boolean;
    isEnabled: boolean;
    isRestoring: boolean;
}

/**
 * Provides unified account identity, auth readiness, and cache-restoration state
 * across all feature query hooks.
 */
export function useAccountQueryContext(tokenOverride?: string | null): AccountQueryContext {
    const storeUserId = useUserStore((state) => state.profile?.id);
    const storeToken = useUserStore((state) => state.token);
    const isBooting = useAuthStore((state) => state.isBooting);
    const isRestoring = useIsRestoring();

    const token = tokenOverride || storeToken || null;
    const userId = storeUserId ?? (token === "guest_token" ? "guest" : undefined);
    const isEnabled = Boolean(userId && token && !isBooting);

    return {
        userId,
        token,
        isBooting,
        isEnabled,
        isRestoring,
    };
}
