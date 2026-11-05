import { useQuery } from "@tanstack/react-query";
import * as Application from "expo-application";
import { useEffect, useMemo } from "react";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Zustand store declaration
const storage = createMMKV({ id: "whats-new-store" });

const mmkvStorage = createJSONStorage(() => ({
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
}));

export interface WhatsNewStoreState {
    lastSeenVersion: string | null;
    seenAnnouncementIds: string[];
    hasHydrated: boolean;
    setHasHydrated: (v: boolean) => void;
    setLastSeenVersion: (version: string) => void;
    markAnnouncementSeen: (id: string) => void;
    initialize: (version: string, announcementIds: string[]) => void;
    reset: () => void;
}

export interface ChangelogItem {
    version: string;
    date: string;
    title: string;
    changes: {
        type: string;
        text: string;
    }[];
}
export interface AnnouncementItem {
    id: string;
    title: string;
    message: string;
    link: { label: string; url: string };
    type: "community" | "alert"; // more later
}

export interface GithubChangelog {
    changelog: ChangelogItem[];
    announcements: AnnouncementItem[];
}

export type WhatsNewItem =
    | { kind: "changelog"; entries: ChangelogItem[] }
    | { kind: "announcement"; announcement: AnnouncementItem };

export const useWhatsNewStore = create<WhatsNewStoreState>()(
    persist(
        (set) => ({
            lastSeenVersion: null,
            seenAnnouncementIds: [],
            hasHydrated: false,
            setHasHydrated: (v: boolean) => set({ hasHydrated: v }),
            setLastSeenVersion: (v: string) => set({ lastSeenVersion: v }),
            markAnnouncementSeen: (id: string) =>
                set((s) => ({
                    seenAnnouncementIds: [...s.seenAnnouncementIds, id],
                })),
            initialize: (version, announcementIds) =>
                set({
                    lastSeenVersion: version,
                    seenAnnouncementIds: announcementIds,
                }),
            reset: () => set({ lastSeenVersion: null, seenAnnouncementIds: [] }),
        }),
        {
            name: "whats-new",
            storage: mmkvStorage,
            onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
        }
    )
);

// util function

const compareVersions = (a: string, b: string) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
};

export function useWhatsNew() {
    const lastSeenVersion = useWhatsNewStore((s) => s.lastSeenVersion);
    const seenAnnouncementIds = useWhatsNewStore((s) => s.seenAnnouncementIds);
    const setLastSeenVersion = useWhatsNewStore((s) => s.setLastSeenVersion);
    const markAnnouncementSeen = useWhatsNewStore((s) => s.markAnnouncementSeen);
    const initialize = useWhatsNewStore((s) => s.initialize);
    const hasHydrated = useWhatsNewStore((s) => s.hasHydrated);

    const { data, isPending } = useQuery({
        queryKey: ["changelog"],
        queryFn: async () => {
            const res = await fetch(
                `https://as2pick.github.io/kolybri-changelog/changelog.json?t=${Date.now()}`,
                {
                    headers: {
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                }
            );
            if (!res.ok) throw new Error("changelog fetch failed");
            const json = await res.json();
            return json as GithubChangelog;
        },
        staleTime: 0,
        gcTime: 0, // supprime le cache dès que plus utilisé
        refetchOnMount: "always", // refetch même si la donnée est "fresh"
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
    });

    const settled = hasHydrated && !isPending;

    useEffect(() => {
        if (hasHydrated && lastSeenVersion === null && data)
            initialize(
                Application.nativeApplicationVersion ?? "1.0.0",
                (data.announcements ?? []).map((a) => a.id)
            );
    }, [hasHydrated, lastSeenVersion, data, initialize]);

    const item = useMemo<WhatsNewItem | null>(() => {
        if (!hasHydrated || !data) return null;
        if (lastSeenVersion === null) return null;
        const entries = (data.changelog ?? [])
            .filter(
                (e: ChangelogItem) =>
                    compareVersions(e.version, lastSeenVersion) > 0 &&
                    compareVersions(
                        e.version,
                        Application.nativeApplicationVersion ?? "1.0.0"
                    ) <= 0
            )
            .sort((a: ChangelogItem, b: ChangelogItem) =>
                compareVersions(b.version, a.version)
            );
        if (entries.length) return { kind: "changelog", entries };

        const announcement = (data.announcements ?? []).find(
            (a: AnnouncementItem) => !seenAnnouncementIds.includes(a.id)
        );

        if (announcement) return { kind: "announcement", announcement };

        return null;
    }, [data, hasHydrated, lastSeenVersion, seenAnnouncementIds]);

    const dismiss = () => {
        if (!item) return;
        if (item.kind === "changelog")
            setLastSeenVersion(Application.nativeApplicationVersion ?? "1.0.0");
        else markAnnouncementSeen(item.announcement.id);
    };
    return { item, dismiss, settled };
}

