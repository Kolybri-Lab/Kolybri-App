import { useMemo } from "react";
import {
    onlineManager,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import homeworksResolver, {
    toggleHomeworkInApi,
} from "@/features/homeworks/resolver/homeworks";
import { injectHomeworksIntoModel } from "@/features/homeworks/utils/homeworks";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import {
    getStoreSubjectColor,
    useSubjectColorDependencies,
} from "@/services/query/subjectColors";
import { useAccountQueryContext } from "@/services/query/useAccountQuery";
import { Homework, ResolvedHomeworks } from "../types";

const updateHomeworkInCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    userId: number | string | undefined,
    id: number,
    updater: (hw: Homework) => Homework
) => {
    const currentData = queryClient.getQueryData<ResolvedHomeworks>(["homeworks", userId]);
    if (!currentData) return;

    const updated = JSON.parse(JSON.stringify(currentData)) as ResolvedHomeworks;
    for (const date of Object.keys(updated)) {
        if (date === "formatedDates") continue;
        const dayHomeworks = updated[date];
        if (Array.isArray(dayHomeworks)) {
            updated[date] = dayHomeworks.map((hw) =>
                hw.id === id ? updater(hw) : hw
            );
        }
    }
    queryClient.setQueryData(["homeworks", userId], updated);
};

export function useHomeworks(token?: string | null) {
    const queryClient = useQueryClient();
    const { userId, token: activeToken, isEnabled, isRestoring } =
        useAccountQueryContext(token);
    const { isDark, officialVersion } = useSubjectColorDependencies();
    const customHomeworks = useCustomDataStore((state) => state.customHomeworks);

    const query = useQuery<ResolvedHomeworks>({
        queryKey: ["homeworks", userId],
        queryFn: () => homeworksResolver({ token: activeToken! }) as Promise<ResolvedHomeworks>,
        enabled: isEnabled,
    });

    const mutation = useMutation<
        void,
        Error,
        { id: number; state: boolean }
    >({
        mutationKey: ["toggleHomework"],
        mutationFn: ({ id, state }) =>
            toggleHomeworkInApi({ token: activeToken!, id, state }),
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ["homeworks", userId] });
            const isOnline = onlineManager.isOnline();

            updateHomeworkInCache(queryClient, userId, id, (hw) => ({
                ...hw,
                isDone: hw.isDone === "done" ? "todo" : "done",
                loadingState: isOnline ? "loading" : "idle",
            }));
        },
        onSuccess: (_data, { id }) => {
            updateHomeworkInCache(queryClient, userId, id, (hw) => ({
                ...hw,
                loadingState: "idle",
            }));
        },
        onError: (_err, { id, state }) => {
            updateHomeworkInCache(queryClient, userId, id, (hw) => ({
                ...hw,
                loadingState: "error",
            }));

            setTimeout(() => {
                updateHomeworkInCache(queryClient, userId, id, (hw) => ({
                    ...hw,
                    isDone: state ? "todo" : "done",
                    loadingState: "idle",
                }));
            }, 3000);
        },
    });

    const data = useMemo(() => {
        const base = query.data ?? ({} as ResolvedHomeworks);
        const existingIds = new Set<number>();
        for (const [key, value] of Object.entries(base)) {
            if (key !== "formatedDates" && Array.isArray(value)) {
                value.forEach((hw) => {
                    if (hw?.id != null) existingIds.add(hw.id);
                });
            }
        }
        const uniqueCustom = customHomeworks.filter(
            (hw) => hw?.id == null || !existingIds.has(hw.id)
        );
        const merged =
            uniqueCustom.length > 0
                ? (injectHomeworksIntoModel(base, uniqueCustom) as ResolvedHomeworks)
                : base;

        const next: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(merged)) {
            if (key !== "formatedDates" && Array.isArray(value)) {
                next[key] = value.map((hw) =>
                    hw.discipline
                        ? {
                              ...hw,
                              discipline: {
                                  ...hw.discipline,
                                  color: getStoreSubjectColor(hw.discipline.code),
                              },
                          }
                        : hw
                );
            } else {
                next[key] = value;
            }
        }

        return next as ResolvedHomeworks;
    }, [query.data, customHomeworks, isDark, officialVersion]);

    return {
        ...query,
        isLoading: query.isLoading || (isRestoring && query.data === undefined),
        data,
        toggleHomework: mutation.mutate,
    };
}
