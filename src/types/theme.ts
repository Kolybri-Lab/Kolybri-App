import { radius, spacing, typography } from "@/themes/tokens";

export type AppThemeConfig = Theme;
export type AppTheme = "light" | "dark";

type ProgressBar = { progress: string; back: string };
type ProgressBarKeys = "primary" | "secondary" | "success";

export type Theme = {
    name: AppTheme;
    isDark: boolean;
    colors: {
        background: {
            app: string;
            auth: string;
        };
        surface: {
            default: string;
            raised: string;
            muted: string;
        };
        text: {
            primary: string;
            secondary: string;
            accent: string;
            brand: string;
            onBrand: string;
        };
        brand: {
            primary: string;
            soft: string;
            vivid: string;
            highlight: string;
        };
        border: {
            subtle: string;
            strong: string;
        };
        state: {
            danger: string;
            success: string;
            warning: string;
        };
    };
    components: {
        tabBar: {
            background: string;
            border: string;
            active: string;
            inactive: string;
        };
        progressBar: {
            progress: string;
            track: string;
        };
    };
    logo: {
        from: string;
        to: string;
        textFrom: string;
        textTo: string;
    };
    spacing: typeof spacing;
    radius: typeof radius;
    typography: typeof typography;
};

