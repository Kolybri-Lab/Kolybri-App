import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import homeworksResolver, {
    toggleHomeworkInApi,
} from "@/features/homeworks/resolver/homeworks";
import { useSubjectStore } from "@/hooks/useSubjectStore";
import { useTheme } from "@/hooks/useThemeStore";
import { Homework, ResolvedHomeworks } from "../types";

const updateHomeworkInCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    id: number,
    updater: (hw: Homework) => Homework
) => {
    const currentData = queryClient.getQueryData<ResolvedHomeworks>(["homeworks"]);
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
    queryClient.setQueryData(["homeworks"], updated);
};

export function useHomeworks(token: string) {
    const queryClient = useQueryClient();
    const { isDark } = useTheme();
    const officialVersion = useSubjectStore((state) => state.officialVersion);

    const query = useQuery<ResolvedHomeworks>({
        queryKey: ["homeworks"],
        queryFn: () => homeworksResolver({ token }) as Promise<ResolvedHomeworks>,
        enabled: Boolean(token),
    });

    const mutation = useMutation<
        void,
        Error,
        { id: number; state: boolean }
    >({
        mutationFn: ({ id, state }) =>
            toggleHomeworkInApi({ token, id, state }),
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ["homeworks"] });

            updateHomeworkInCache(queryClient, id, (hw) => ({
                ...hw,
                isDone: hw.isDone === "done" ? "todo" : "done",
                loadingState: "loading",
            }));
        },
        onSuccess: (_data, { id }) => {
            updateHomeworkInCache(queryClient, id, (hw) => ({
                ...hw,
                loadingState: "idle",
            }));
        },
        onError: (_err, { id, state }) => {
            updateHomeworkInCache(queryClient, id, (hw) => ({
                ...hw,
                loadingState: "error",
            }));

            setTimeout(() => {
                updateHomeworkInCache(queryClient, id, (hw) => ({
                    ...hw,
                    isDone: state ? "todo" : "done",
                    loadingState: "idle",
                }));
            }, 3000);
        },
    });

    const data = useMemo(() => {
        if (!query.data) return {} as ResolvedHomeworks;
        const getSubjectColor = useSubjectStore.getState().getSubjectColor;
        const next: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(query.data)) {
            if (key !== "formatedDates" && Array.isArray(value)) {
                next[key] = value.map((hw) =>
                    hw.discipline
                        ? {
                              ...hw,
                              discipline: {
                                  ...hw.discipline,
                                  color: getSubjectColor(hw.discipline.code),
                              },
                          }
                        : hw
                );
            } else {
                next[key] = value;
            }
        }

        return next as ResolvedHomeworks;
    }, [query.data, isDark, officialVersion]);

    return {
        ...query,
        data,
        toggleHomework: mutation.mutate,
    };
}
