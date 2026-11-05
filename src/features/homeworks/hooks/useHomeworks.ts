import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import homeworksResolver, {
    toggleHomeworkInApi,
} from "@/features/homeworks/resolver/homeworks";
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

    const query = useQuery<ResolvedHomeworks>({
        queryKey: ["homeworks"],
        queryFn: () => homeworksResolver({ token }) as Promise<ResolvedHomeworks>,
        enabled: Boolean(token),
    });

    const mutation = useMutation<
        void,
        Error,
        { id: number; state: boolean },
        { previousHomeworks: ResolvedHomeworks | undefined }
    >({
        mutationFn: ({ id, state }) =>
            toggleHomeworkInApi({ token, id, state }),
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ["homeworks"] });
            const previousHomeworks =
                queryClient.getQueryData<ResolvedHomeworks>(["homeworks"]);

            updateHomeworkInCache(queryClient, id, (hw) => ({
                ...hw,
                isDone: hw.isDone === "done" ? "todo" : "done",
                loadingState: "loading",
            }));

            return { previousHomeworks };
        },
        onSuccess: (_data, { id }) => {
            updateHomeworkInCache(queryClient, id, (hw) => ({
                ...hw,
                loadingState: "idle",
            }));
        },
        onError: (_err, { id }, context) => {
            const previousHomeworks = context?.previousHomeworks;

            if (previousHomeworks) {
                updateHomeworkInCache(queryClient, id, (hw) => ({
                    ...hw,
                    loadingState: "error",
                }));

                setTimeout(() => {
                    queryClient.setQueryData(["homeworks"], previousHomeworks);
                }, 3000);
            }
        },
    });

    return {
        ...query,
        data: query.data ?? ({} as ResolvedHomeworks),
        toggleHomework: mutation.mutate,
    };
}
