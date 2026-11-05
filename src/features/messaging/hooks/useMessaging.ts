import messagingResolver, {
    messageContentResolver,
} from "@/features/messaging/resolver/messaging";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { MessageContent, ResolvedMessaging } from "../types";

export interface UseMessagingOptions {
    typeOfRecovery?: "received" | "sent" | "draft" | "archived";
    binderId?: number;
    itemsPerPage?: number;
}

const PAGINATION_KEY_MAP = {
    received: "receivedCount",
    sent: "sentCount",
    draft: "draftCount",
    archived: "archivedCount",
} as const;

export function useMessaging(token: string, options: UseMessagingOptions = {}) {
    const { typeOfRecovery = "received", binderId = 0, itemsPerPage = 20 } = options;

    return useInfiniteQuery<ResolvedMessaging>({
        queryKey: ["messaging", typeOfRecovery, binderId],
        queryFn: ({ pageParam = 0 }) =>
            messagingResolver({
                token,
                page: pageParam as number,
                itemsPerPage,
                typeOfRecovery,
                binderId,
            }) as Promise<ResolvedMessaging>,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage) return undefined;

            const lastPageMessages = lastPage[typeOfRecovery] || [];
            if (lastPageMessages.length === 0) return undefined;

            const paginationKey = PAGINATION_KEY_MAP[typeOfRecovery];
            const totalAvailable = lastPage.pagination?.[paginationKey] ?? Infinity;
            const totalFetchedIds = new Set(
                allPages.flatMap((page) =>
                    (page[typeOfRecovery] || []).map((m) => m.id)
                )
            );
            if (totalFetchedIds.size >= totalAvailable) {
                return undefined;
            }
            if (allPages.length > 1) {
                const previousPage = allPages[allPages.length - 2];
                const previousIds = new Set(
                    (previousPage[typeOfRecovery] || []).map((m) => m.id)
                );
                const hasAnyNewId = lastPageMessages.some(
                    (m) => !previousIds.has(m.id)
                );
                if (!hasAnyNewId) {
                    return undefined;
                }
            }

            return allPages.length;
        },
        enabled: Boolean(token),
    });
}

export function useMessageContent(
    token: string,
    messageId: number | string | undefined,
    mode: "recipient" | "sender" = "recipient"
) {
    return useQuery<MessageContent>({
        queryKey: ["message", messageId, mode],
        queryFn: () =>
            messageContentResolver({
                token,
                messageId: messageId!,
                mode,
            }) as Promise<MessageContent>,
        enabled: Boolean(token) && messageId !== undefined,
    });
}
