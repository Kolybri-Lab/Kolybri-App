import { generateSubjectColor } from "@/themes/color";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SubjectColor, SubjectColorContext } from "../types";
import { useThemeStore } from "./useThemeStore";

const storage = createMMKV({ id: "color-store" });

const mmkvStorage = createJSONStorage(() => ({
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
}));

const GOLDEN = 137.508;

const isSubjectColor = (value: unknown): value is SubjectColor =>
    typeof value === "object" &&
    value !== null &&
    typeof (value as SubjectColor).light === "string" &&
    typeof (value as SubjectColor).dark === "string";

const pickVariant = (pair: SubjectColor, isDark: boolean): string =>
    isDark ? pair.dark : pair.light;

interface ColorStoreState {
    subjectColors: Record<string, SubjectColorContext>;
    nextIndex: number;
    officialVersion: number;
    // Warning: This updates store state, do not call inside render methods!
    getOrAssignColor: (subject: string) => string;
    getSubjectColor: (subject?: string) => string;
    resolveColorForTheme: (color: string | undefined, isDark: boolean) => string;
    setSubjectIndex: (subject: string, index: number) => void;
    setSubjectColor: (subject: string, color: SubjectColor | string) => void;
    reset: () => void;
}

export const useColorStore = create<ColorStoreState>()(
    persist(
        (set, get) => ({
            subjectColors: {},
            nextIndex: 0,
            officialVersion: 0,

            // Warning: This updates store state, do not call inside render methods!
            getOrAssignColor: (subject: string): string => {
                const key = subject?.trim();
                if (!key) return get().getSubjectColor(subject);

                const { subjectColors, nextIndex, officialVersion } = get();
                const isDark = useThemeStore.getState().getTheme().isDark;
                const existing = subjectColors[key];

                if (existing && isSubjectColor(existing.color)) {
                    return pickVariant(existing.color, isDark);
                }

                if (existing !== undefined) {
                    const pair = generateSubjectColor(
                        (existing.index * GOLDEN) % 360
                    );
                    set({
                        subjectColors: {
                            ...subjectColors,
                            [key]: { index: existing.index, color: pair },
                        },
                        officialVersion: officialVersion + 1,
                    });
                    return pickVariant(pair, isDark);
                }

                const newIndex = nextIndex;
                const pair = generateSubjectColor((newIndex * GOLDEN) % 360);
                set({
                    subjectColors: {
                        ...subjectColors,
                        [key]: { index: newIndex, color: pair },
                    },
                    nextIndex: newIndex + 1,
                    officialVersion: officialVersion + 1,
                });

                return pickVariant(pair, isDark);
            },

            getSubjectColor: (subject?: string): string => {
                const { subjectColors } = get();
                const theme = useThemeStore.getState().getTheme();

                if (Object.keys(subjectColors).length === 0) {
                    return theme.colors.brand.primary;
                }

                const key = subject?.trim();
                const existing = key ? subjectColors[key] : undefined;
                if (!existing) {
                    return theme.colors.text.secondary;
                }

                if (isSubjectColor(existing.color)) {
                    return pickVariant(existing.color, theme.isDark);
                }

                const pair = generateSubjectColor(
                    (existing.index * GOLDEN) % 360
                );
                return pickVariant(pair, theme.isDark);
            },

            resolveColorForTheme: (
                color: string | undefined,
                isDark: boolean
            ): string => {
                if (!color) return "";
                const entries = Object.values(get().subjectColors);
                for (const ctx of entries) {
                    if (
                        isSubjectColor(ctx.color) &&
                        (ctx.color.light === color || ctx.color.dark === color)
                    ) {
                        return pickVariant(ctx.color, isDark);
                    }
                }
                return color;
            },

            setSubjectIndex: (subject: string, index: number) =>
                set((state) => ({
                    subjectColors: {
                        ...state.subjectColors,
                        [subject]: {
                            index,
                            color: generateSubjectColor((index * GOLDEN) % 360),
                        },
                    },
                })),
            setSubjectColor: (
                subject: string,
                color: SubjectColor | string
            ) =>
                set((state) => {
                    const pair: SubjectColor = isSubjectColor(color)
                        ? color
                        : { light: color, dark: color };
                    return {
                        subjectColors: {
                            ...state.subjectColors,
                            [subject]: {
                                ...state.subjectColors[subject],
                                color: pair,
                            },
                        },
                    };
                }),

            reset: () => set({ subjectColors: {}, nextIndex: 0 }),
        }),
        {
            name: "color-store",
            version: 5,
            storage: mmkvStorage,
            migrate: () => ({ subjectColors: {}, nextIndex: 0 }),
            partialize: (state) => ({
                subjectColors: state.subjectColors,
                nextIndex: state.nextIndex,
            }),
        }
    )
);

