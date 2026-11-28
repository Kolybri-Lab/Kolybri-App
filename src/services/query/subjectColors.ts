import { useSubjectStore } from "@/hooks/useSubjectStore";
import { useTheme } from "@/hooks/useThemeStore";

/**
 * Subscribes to theme and official subject-color version changes so feature hooks
 * recompute colors from `useSubjectStore` (the single source of truth).
 */
export function useSubjectColorDependencies() {
    const { isDark } = useTheme();
    const officialVersion = useSubjectStore((state) => state.officialVersion);
    return { isDark, officialVersion };
}

/**
 * Resolves a subject color from `useSubjectStore` by subject code.
 */
export function getStoreSubjectColor(code?: string): string {
    return useSubjectStore.getState().getSubjectColor(code ?? "");
}

/**
 * Adapts an existing color string for the current theme via `useSubjectStore`.
 */
export function resolveStoreColorForTheme(
    color: string | undefined,
    isDark: boolean,
): string | undefined {
    if (!color) return color;
    return useSubjectStore.getState().resolveColorForTheme(color, isDark);
}
