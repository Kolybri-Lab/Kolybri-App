import { generateSubjectColor } from "@/themes/color";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OfficialSubject, SubjectColor } from "../types";
import { useThemeStore } from "./useThemeStore";

const storage = createMMKV({ id: "subject-store" });

const mmkvStorage = createJSONStorage(() => ({
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
}));

const GOLDEN = 137.508;

const pickVariant = (pair: SubjectColor, isDark: boolean): string =>
    isDark ? pair.dark : pair.light;

export interface RegisterSubjectInput {
    code: string;
    name: string;
    teachers: string[];
}

interface SubjectStoreState {
    subjects: Record<string, OfficialSubject>;
    nextIndex: number;
    officialVersion: number;
    // Warning: Updates store state, do not call inside render methods!
    registerSubject: (input: RegisterSubjectInput) => string;
    getSubject: (code?: string) => OfficialSubject | undefined;
    getAllSubjects: () => OfficialSubject[];
    getSubjectColor: (code?: string) => string;
    resolveColorForTheme: (color: string | undefined, isDark: boolean) => string;
    setSubjectColor: (code: string, color: SubjectColor | string) => void;
    reset: () => void;
}

export const useSubjectStore = create<SubjectStoreState>()(
    persist(
        (set, get) => ({
            subjects: {},
            nextIndex: 0,
            officialVersion: 0,

            registerSubject: ({ code, name, teachers }): string => {
                const key = code?.trim();
                if (!key) return get().getSubjectColor(code);

                const { subjects, nextIndex, officialVersion } = get();
                const isDark = useThemeStore.getState().getTheme().isDark;
                const existing = subjects[key];

                if (existing) {
                    const cleanName = name?.trim() || existing.name;
                    const teachersChanged =
                        teachers.length !== existing.teachers.length ||
                        teachers.some((t, i) => t !== existing.teachers[i]);

                    if (cleanName !== existing.name || teachersChanged) {
                        set({
                            subjects: {
                                ...subjects,
                                [key]: {
                                    ...existing,
                                    name: cleanName,
                                    teachers,
                                },
                            },
                        });
                    }
                    return pickVariant(existing.color, isDark);
                }

                const newIndex = nextIndex;
                const color = generateSubjectColor((newIndex * GOLDEN) % 360);
                set({
                    subjects: {
                        ...subjects,
                        [key]: {
                            code: key,
                            name: name?.trim() || key,
                            teachers,
                            index: newIndex,
                            color,
                        },
                    },
                    nextIndex: newIndex + 1,
                    officialVersion: officialVersion + 1,
                });

                return pickVariant(color, isDark);
            },

            getSubject: (code) => {
                const key = code?.trim();
                return key ? get().subjects[key] : undefined;
            },

            getAllSubjects: () =>
                Object.values(get().subjects).sort((a, b) => a.index - b.index),

            getSubjectColor: (code): string => {
                const { subjects } = get();
                const theme = useThemeStore.getState().getTheme();

                if (Object.keys(subjects).length === 0) {
                    return theme.colors.brand.primary;
                }

                const key = code?.trim();
                const existing = key ? subjects[key] : undefined;
                if (!existing) {
                    return theme.colors.text.secondary;
                }

                return pickVariant(existing.color, theme.isDark);
            },

            resolveColorForTheme: (color, isDark): string => {
                if (!color) return "";
                for (const subject of Object.values(get().subjects)) {
                    if (
                        subject.color.light === color ||
                        subject.color.dark === color
                    ) {
                        return pickVariant(subject.color, isDark);
                    }
                }
                return color;
            },

            setSubjectColor: (code, color) =>
                set((state) => {
                    const key = code?.trim();
                    const existing = key ? state.subjects[key] : undefined;
                    if (!key || !existing) return state;
                    const pair: SubjectColor =
                        typeof color === "string"
                            ? { light: color, dark: color }
                            : color;
                    return {
                        subjects: {
                            ...state.subjects,
                            [key]: { ...existing, color: pair },
                        },
                    };
                }),

            reset: () => set({ subjects: {}, nextIndex: 0 }),
        }),
        {
            name: "subject-store",
            version: 1,
            storage: mmkvStorage,
            partialize: (state) => ({
                subjects: state.subjects,
                nextIndex: state.nextIndex,
            }),
        }
    )
);
