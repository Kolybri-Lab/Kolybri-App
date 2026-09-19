import { useErrorStore } from "@/hooks/useErrorStore";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
    defaultShouldDehydrateQuery,
    MutationCache,
    QueryCache,
    QueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createMMKV } from "react-native-mmkv";

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
            staleTime: 1000 * 60 * 60, // 1h
            gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
            placeholderData: (previousData) => previousData,
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

const mmkv = createMMKV({ id: "query-cache" });

const mmkvPersister = createAsyncStoragePersister({
    storage: {
        getItem: (key) => mmkv.getString(key) ?? null,
        setItem: (key, value) => {
            mmkv.set(key, value);
        },
        removeItem: (key) => {
            mmkv.remove(key);
        },
    },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
                persister: mmkvPersister,
                dehydrateOptions: {
                    shouldDehydrateQuery: (query) => {
                        if (query.queryKey[0] === "timetable") {
                            const offset = query.queryKey[1];
                            const isPersistableOffset =
                                offset === -1 || offset === 0 || offset === 1;
                            return (
                                isPersistableOffset &&
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

