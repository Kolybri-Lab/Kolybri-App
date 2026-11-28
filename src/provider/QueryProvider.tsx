import { useErrorStore } from "@/hooks/useErrorStore";
import { useUserStore } from "@/hooks/useUserStore";
import { toggleHomeworkInApi } from "@/features/homeworks/resolver/homeworks";
import {
    defaultShouldDehydrateQuery,
    hydrate,
    MutationCache,
    QueryCache,
    QueryClient,
} from "@tanstack/react-query";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import dayjs from "dayjs";
import { createMMKV } from "react-native-mmkv";

const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days (survives school holidays offline)
const PERSIST_KEY = "REACT_QUERY_OFFLINE_CACHE";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onSuccess: () => {
            useErrorStore.getState().clearNetworkErrors();
        },
        onError: (error) => {
            useErrorStore.getState().pushError(error as any);
        },
    }),
    mutationCache: new MutationCache({
        onSuccess: () => {
            useErrorStore.getState().clearNetworkErrors();
        },
        onError: (error) => {
            useErrorStore.getState().pushError(error as any);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 30, // 30 minutes
            gcTime: CACHE_MAX_AGE,
            placeholderData: (previousData: unknown) => previousData,
            retry: (failureCount, error: any) => {
                if (
                    error?.type === "auth" ||
                    error?.type === "api-business" ||
                    error?.code === 403 ||
                    error?.code === 401
                ) {
                    return false;
                }
                return failureCount < 1;
            },
        },
    },
});

queryClient.setMutationDefaults(["toggleHomework"], {
    mutationFn: ({ id, state }: { id: number; state: boolean }) =>
        toggleHomeworkInApi({
            token: useUserStore.getState().token ?? "",
            id,
            state,
        }),
});

const mmkv = createMMKV({ id: "query-cache" });

function readPersistedClientSync(): PersistedClient | undefined {
    try {
        const raw = mmkv.getString(PERSIST_KEY);
        if (!raw) return undefined;
        return JSON.parse(raw) as PersistedClient;
    } catch {
        return undefined;
    }
}

export const mmkvPersister: Persister = {
    persistClient: (client: PersistedClient) => {
        try {
            mmkv.set(PERSIST_KEY, JSON.stringify(client));
        } catch (error) {
            console.warn("Failed to persist query cache to MMKV:", error);
        }
    },
    restoreClient: () => readPersistedClientSync(),
    removeClient: () => {
        mmkv.remove(PERSIST_KEY);
    },
};

// Synchronous initial hydration so cached queries are available on the very first render
const initialCache = readPersistedClientSync();
if (initialCache && Date.now() - initialCache.timestamp <= CACHE_MAX_AGE) {
    hydrate(queryClient, initialCache.clientState);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: mmkvPersister,
                maxAge: CACHE_MAX_AGE,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => {
                        if (query.queryKey[0] === "timetable") {
                            // queryKey: ["timetable", userId, mondayDate]
                            const mondayDate = query.queryKey[2];
                            if (typeof mondayDate !== "string") return false;

                            // Ne persister que les semaines autour d'aujourd'hui (+/- 14 jours)
                            const now = dayjs();
                            const monday = dayjs(mondayDate);
                            const diffDays = Math.abs(monday.diff(now, "day"));
                            return (
                                diffDays <= 14 &&
                                query.state.status === "success"
                            );
                        }
                        return defaultShouldDehydrateQuery(query);
                    },
                },
            }}
            onSuccess={() => queryClient.resumePausedMutations()}
        >
            {children}
        </PersistQueryClientProvider>
    );
}

