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
    testItem: WhatsNewItem | null;
    setHasHydrated: (v: boolean) => void;
    setLastSeenVersion: (version: string) => void;
    markAnnouncementSeen: (id: string) => void;
    initialize: (version: string, announcementIds: string[]) => void;
    setTestItem: (item: WhatsNewItem | null) => void;
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
    link?: { label: string; url: string };
    type?: "community" | "alert";
    minVersion?: string;
    maxDate?: string;
    priority?: number;
    disabled?: boolean;
}

export type GithubAnnouncementsResponse =
    | AnnouncementItem[]
    | { announcements: AnnouncementItem[]; changelog?: ChangelogItem[] };

export type WhatsNewItem =
    | { kind: "changelog"; entries: ChangelogItem[] }
    | { kind: "announcement"; announcement: AnnouncementItem };

export const useWhatsNewStore = create<WhatsNewStoreState>()(
    persist(
        (set) => ({
            lastSeenVersion: null,
            seenAnnouncementIds: [],
            hasHydrated: false,
            testItem: null,
            setHasHydrated: (v: boolean) => set({ hasHydrated: v }),
            setLastSeenVersion: (v: string) => set({ lastSeenVersion: v }),
            markAnnouncementSeen: (id: string) =>
                set((s) => ({
                    seenAnnouncementIds: s.seenAnnouncementIds.includes(id)
                        ? s.seenAnnouncementIds
                        : [...s.seenAnnouncementIds, id],
                })),
            initialize: (version, announcementIds) =>
                set({
                    lastSeenVersion: version,
                    seenAnnouncementIds: announcementIds,
                }),
            setTestItem: (item) => set({ testItem: item }),
            reset: () => set({ lastSeenVersion: null, seenAnnouncementIds: [], testItem: null }),
        }),
        {
            name: "whats-new",
            storage: mmkvStorage,
            partialize: (state) => ({
                lastSeenVersion: state.lastSeenVersion,
                seenAnnouncementIds: state.seenAnnouncementIds,
            }),
            onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
        }
    )
);

// util function

export const compareVersions = (a: string, b: string) => {
    const cleanA = a.split("-")[0];
    const cleanB = b.split("-")[0];
    const pa = cleanA.split(".").map((n) => parseInt(n, 10) || 0);
    const pb = cleanB.split(".").map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length, 3);
    for (let i = 0; i < len; i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
};

export const isAnnouncementExpired = (maxDate?: string): boolean => {
    if (!maxDate) return false;
    const target = maxDate.includes("T") ? maxDate : `${maxDate}T23:59:59.999`;
    const expDate = new Date(target);
    if (isNaN(expDate.getTime())) return false;
    return Date.now() > expDate.getTime();
};

const OFFICIAL_ANNOUNCEMENTS_URL =
    "https://kolybri-lab.github.io/kolybri-announcements/announcements.json";

export function useWhatsNew() {
    const lastSeenVersion = useWhatsNewStore((s) => s.lastSeenVersion);
    const seenAnnouncementIds = useWhatsNewStore((s) => s.seenAnnouncementIds);
    const setLastSeenVersion = useWhatsNewStore((s) => s.setLastSeenVersion);
    const markAnnouncementSeen = useWhatsNewStore((s) => s.markAnnouncementSeen);
    const hasHydrated = useWhatsNewStore((s) => s.hasHydrated);

    const currentVersion = Application.nativeApplicationVersion ?? "1.0.0";

    const { data, isPending } = useQuery({
        queryKey: ["announcements"],
        queryFn: async () => {
            const res = await fetch(
                `${OFFICIAL_ANNOUNCEMENTS_URL}?t=${Date.now()}`,
                {
                    headers: {
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                }
            );
            if (!res.ok) throw new Error("announcements fetch failed");
            const text = await res.text();
            if (!text || !text.trim()) return [] as AnnouncementItem[];
            const json = JSON.parse(text);
            return (Array.isArray(json)
                ? json
                : json.announcements ?? []) as AnnouncementItem[];
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
    });

    const testItem = useWhatsNewStore((s) => s.testItem);
    const setTestItem = useWhatsNewStore((s) => s.setTestItem);

    const settled = hasHydrated && !isPending;

    const item = useMemo<WhatsNewItem | null>(() => {
        if (testItem) return testItem;
        if (!hasHydrated || !data || !Array.isArray(data)) return null;

        const eligibleAnnouncements = data
            .map((item, originalIndex) => ({ item, originalIndex }))
            .filter(({ item: a }) => {
                if (!a || !a.id) return false;

                // Désactivée manuellement
                if (a.disabled) return false;

                // Déjà consultée
                if (seenAnnouncementIds.includes(a.id)) return false;

                // Date limite dépassée
                if (isAnnouncementExpired(a.maxDate)) return false;

                // Version minimale requise non atteinte
                if (a.minVersion && compareVersions(currentVersion, a.minVersion) < 0) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                const priorityA = typeof a.item.priority === "number" ? a.item.priority : 3;
                const priorityB = typeof b.item.priority === "number" ? b.item.priority : 3;

                // 1. Comparaison par priorité (1 est prioritaire sur 2, 3...)
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                // 2. À priorité égale : la dernière ajoutée dans le JSON (plus grand index) passe en premier
                return b.originalIndex - a.originalIndex;
            })
            .map(({ item: a }) => a);

        const announcement = eligibleAnnouncements[0] ?? null;

        if (announcement) return { kind: "announcement", announcement };

        return null;
    }, [testItem, data, hasHydrated, seenAnnouncementIds, currentVersion]);

    const dismiss = () => {
        if (testItem) {
            setTestItem(null);
            return;
        }
        if (!item) return;
        if (item.kind === "changelog") {
            setLastSeenVersion(currentVersion);
        } else {
            markAnnouncementSeen(item.announcement.id);
        }
    };
    return { item, dismiss, settled, currentVersion };
}

