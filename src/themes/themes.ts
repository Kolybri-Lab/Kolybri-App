import { Theme } from "@/types";
import { AppTheme } from "@/types/theme";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";

export const THEMES_ASSOCIATIONS: Record<AppTheme, Theme> = {
    light: lightTheme,
    dark: darkTheme,
};

