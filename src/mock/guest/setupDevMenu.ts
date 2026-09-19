import { useErrorStore } from "@/hooks/useErrorStore";
import { useThemeStore } from "@/hooks/useThemeStore";
import { queryClient } from "@/provider/QueryProvider";
import { registerDevMenuItems } from "expo-dev-menu";
import { resetAllGuestTests } from "./guestData";
import { isLogsEnabled, toggleLogs } from "@/utils/logger";

export async function setupDevMenu() {
    if (!__DEV__) return;

    try {
        await registerDevMenuItems([
            {
                name: "1. Mode clair/sombre",
                shouldCollapse: true,
                callback: () => {
                    const currentMode = useThemeStore.getState().themeMode;
                    const followSystem = useThemeStore.getState().followSystem;
                    const systemTheme = useThemeStore.getState().systemTheme;
                    const active = followSystem ? systemTheme : currentMode;
                    useThemeStore
                        .getState()
                        .setThemeMode(active === "dark" ? "light" : "dark");
                },
            },
            {
                name: "2. Erreur API",
                shouldCollapse: true,
                callback: () => {
                    useErrorStore.getState().pushError({
                        type: "api-business",
                        code: 403,
                        message: "ED 403 : Adresse IP enregistrée / WAF",
                    });
                },
            },
            {
                name: "3. Panne réseau",
                shouldCollapse: true,
                callback: () => {
                    useErrorStore.getState().pushError({
                        type: "network",
                        message: "Connexion Internet interrompue",
                        isRetryable: true,
                    });
                },
            },
            {
                name: "4. Reset des erreurs",
                shouldCollapse: true,
                callback: () => {
                    useErrorStore.getState().clearAll();
                },
            },
            {
                name: "5. Résoudre et reset les tests",
                shouldCollapse: true,
                callback: () => {
                    useErrorStore.getState().clearAll();
                    resetAllGuestTests();
                    queryClient.invalidateQueries();
                },
            },
            {
                name: `6. Logs : ${isLogsEnabled() ? "🟢 ON" : "🔴 OFF"}`,
                shouldCollapse: true,
                callback: () => {
                    const active = toggleLogs();
                    console.log(
                        `[DevMenu] Logs ${active ? "activés (ON)" : "désactivés (OFF)"}`
                    );
                    setupDevMenu();
                },
            },
        ]);
    } catch (e) {
        console.warn("Dev menu items registration failed:", e);
    }
}
