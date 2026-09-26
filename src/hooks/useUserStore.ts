// stores/userStore.ts
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserPreferences, UserProfile } from "../types";

const storage = createMMKV({ id: "user-store" });

const mmkvStorage = createJSONStorage(() => ({
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
}));

type DataPreferenceKey = keyof UserPreferences["dataPreferences"];

interface SharePromptState {
    sessionCount: number;
    promptsShown: number;
    lastPromptAtSession: number | null;
    hasShared: boolean;
    dismissedForGood: boolean;
}

interface UserStoreState {
    profile: UserProfile | null;
    preferences: UserPreferences;
    token: string | null;
    hasHydrated: boolean;
    sharePrompt: SharePromptState;

    setProfile: (profile: UserProfile | null) => void;
    setToken: (token: string | null) => void;
    setDataPreference: (key: DataPreferenceKey, value: boolean) => void;
    setPreferences: (preferences: Partial<UserPreferences>) => void;
    setHasHydrated: (value: boolean) => void;
    incrementSession: () => void;
    markSharePromptShown: () => void;
    markShared: () => void;
    markShareDismissedForGood: () => void;
    reset: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: "dark",
    isFollowingSystem: false,
    dataPreferences: {
        sendData: "only_things",
        osInfo: false,
        modelInfo: false,
        screenInfo: true,
    },
};

const DEFAULT_SHARE_PROMPT: SharePromptState = {
    sessionCount: 0,
    promptsShown: 0,
    lastPromptAtSession: null,
    hasShared: false,
    dismissedForGood: false,
};

const FIRST_PROMPT_AT_SESSION = 4;
const SESSIONS_BETWEEN_RETRIES = 20;
const MAX_PROMPTS = 2;

export const useUserStore = create<UserStoreState>()(
    persist(
        (set, get) => ({
            profile: null,
            preferences: DEFAULT_PREFERENCES,
            token: null,
            hasHydrated: false,
            sharePrompt: DEFAULT_SHARE_PROMPT,

            setProfile: (profile) => set({ profile }),
            setToken: (token) => set({ token }),
            setDataPreference: (key, value) =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        dataPreferences: {
                            ...state.preferences.dataPreferences,
                            [key]: value,
                        },
                    },
                })),

            setPreferences: (partial) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...partial },
                })),

            setHasHydrated: (value) => set({ hasHydrated: value }),

            incrementSession: () =>
                set((state) => ({
                    sharePrompt: {
                        ...state.sharePrompt,
                        sessionCount: state.sharePrompt.sessionCount + 1,
                    },
                })),

            markSharePromptShown: () =>
                set((state) => ({
                    sharePrompt: {
                        ...state.sharePrompt,
                        promptsShown: state.sharePrompt.promptsShown + 1,
                        lastPromptAtSession: state.sharePrompt.sessionCount,
                        dismissedForGood:
                            state.sharePrompt.promptsShown + 1 >= MAX_PROMPTS,
                    },
                })),

            markShared: () =>
                set((state) => ({
                    sharePrompt: { ...state.sharePrompt, hasShared: true },
                })),

            markShareDismissedForGood: () =>
                set((state) => ({
                    sharePrompt: { ...state.sharePrompt, dismissedForGood: true },
                })),

            reset: () => set({ profile: null, token: null }),
        }),
        {
            name: "user-store",
            storage: mmkvStorage,
            partialize: (state) => ({
                profile: state.profile,
                preferences: state.preferences,
                sharePrompt: state.sharePrompt,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export function shouldShowSharePrompt(sharePrompt: SharePromptState): boolean {
    if (sharePrompt.hasShared || sharePrompt.dismissedForGood) return false;
    if (sharePrompt.promptsShown === 0) {
        return sharePrompt.sessionCount >= FIRST_PROMPT_AT_SESSION;
    }
    if (sharePrompt.lastPromptAtSession === null) return false;
    return (
        sharePrompt.sessionCount - sharePrompt.lastPromptAtSession >=
        SESSIONS_BETWEEN_RETRIES
    );
}
