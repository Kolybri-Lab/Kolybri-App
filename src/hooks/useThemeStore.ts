import { THEMES_ASSOCIATIONS } from "@/themes/themes";
import { Appearance } from "react-native";
import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppTheme, AppThemeConfig } from "../types";

const storage = createMMKV({ id: "theme-store" });

const mmkvStorage = createJSONStorage(() => ({
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.remove(key),
}));

interface ThemeState {
    themeMode: AppTheme;
    followSystem: boolean;
    systemTheme: AppTheme;
    hapticsEnabled: boolean;

    setThemeMode: (mode: AppTheme) => void;
    setFollowSystem: (follow: boolean) => void;
    setSystemTheme: (theme: AppTheme) => void;
    setHapticsEnabled: (state: boolean) => void;
    getTheme: () => AppThemeConfig;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            themeMode: "dark",
            followSystem: true,
            systemTheme: Appearance.getColorScheme() || "dark",
            hapticsEnabled: true,

            setThemeMode: (themeMode) => set({ themeMode, followSystem: false }),
            setFollowSystem: (followSystem) => set({ followSystem }),
            setSystemTheme: (systemTheme) => set({ systemTheme }),
            setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
            getTheme: () => {
                const { followSystem, systemTheme, themeMode } = get();
                const activeMode = followSystem ? systemTheme : themeMode;
                return THEMES_ASSOCIATIONS[activeMode];
            },
        }),
        {
            name: "theme-store",
            storage: mmkvStorage,
            partialize: (state) => ({
                themeMode: state.themeMode,
                followSystem: state.followSystem,
                hapticsEnabled: state.hapticsEnabled,
            }),
        }
    )
);

export const useTheme = () => {
    return useThemeStore((state) => {
        const activeMode = state.followSystem ? state.systemTheme : state.themeMode;
        return THEMES_ASSOCIATIONS[activeMode];
    });
};

export const useActiveThemeMode = () => {
    return useThemeStore((state) =>
        state.followSystem ? state.systemTheme : state.themeMode
    );
};
