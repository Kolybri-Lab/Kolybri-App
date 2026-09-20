import { radius, spacing, typography } from "./tokens";

export type ThemeName = "light" | "dark";

type ProgressBar = { progress: string; back: string };
type ProgressBarKeys = "primary" | "secondary" | "success";
// Le type est LA source de vérité : un thème qui oublie une clé ne compile pas.
export type Theme = {
    name: ThemeName;
    isDark: boolean;
    colors: {
        overlay: {
            white: string;
            black: string;
        };
        background: {
            screen: string; // fond des écrans
            base: string; // fond UNI de référence (bas du dégradé) : barre de navigation, écrans plats
            auth: string; // fond de l'écran de connexion
            // null = pas de dégradé, on utilise `screen`
            gradient: {
                colors: readonly [string, string];
                locations: readonly [number, number];
            } | null;
        };
        surface: {
            card: string; // cartes, listes
            raised: string; // panneaux au-dessus des cartes (modales, encarts)
            muted: string; // zones secondaires, champs
            simpleOpacity: string;
        };
        text: {
            primary: string;
            secondary: string;
            muted: string; // désactivé, placeholders
            secondaryContrast: string;
            onPrimary: string; // texte sur fond brand.primary
        };
        brand: {
            primary: string; // boutons, éléments actifs
            accent: string; // liens, chiffres mis en avant
            soft: string; // fonds teintés (badges, pastilles)
        };
        border: {
            subtle: string; // séparateurs, contours discrets (translucide)
            strong: string; // contours visibles (champs, boutons)
        };
        state: {
            danger: string;
            success: string;
            warning: string;
        };
        progressBar: Record<ProgressBarKeys, ProgressBar>;
        tabBar: {
            background: string;
            border: string;
            active: string;
            inactive: string;
        };
        logo: {
            from: string;
            to: string;
            textFrom: string;
            textTo: string;
        };
    };
    shadow: { opacity: number; color: string };
    spacing: typeof spacing;
    radius: typeof radius;
    typography: typeof typography;
};

const shared = { spacing, radius, typography };

// Ancien « opulent »
export const lightTheme: Theme = {
    name: "light",
    isDark: false,
    colors: {
        overlay: {
            white: "hsl(0, 0%, 100%)",
            black: "hsl(0, 0%, 0%)",
        },
        background: {
            screen: "hsl(211, 74%, 94%)", // ancien pastel / background.gradient
            base: "hsl(240, 74%, 93%)", // pas de dégradé en clair : identique à screen
            auth: "hsl(240, 100%, 95%)", // ancien background.login
            gradient: {
                colors: ["hsl(248, 73%, 29%)", "hsl(240, 50%, 8%)"],
                locations: [0, 0.28],
            },
        },
        surface: {
            card: "hsl(0, 0%, 100%)", // ancien secondary (utilisé comme fond de carte)
            raised: "hsl(215, 100%, 87%)", // ancien case
            muted: "hsl(240, 100%, 97%)", // à ajuster
            simpleOpacity: "hsl(0, 0%, 0%)",
        },
        text: {
            primary: "hsl(0, 0%, 0%)", // ancien contrast
            secondary: "hsl(213, 98%, 61%)", // à ajuster (contraste ≥ 4.5:1)
            muted: "hsl(0, 0%, 38%)", // à ajuster (contraste ≥ 4.5:1)
            secondaryContrast: "hsl(217, 42%, 40%)",
            onPrimary: "hsl(0, 0%, 100%)",
        },
        brand: {
            primary: "hsl(240, 89%, 72%)", // ancien main
            accent: "hsl(240, 70%, 55%)", // ancien accent
            soft: "hsl(240, 95%, 85%)", // ancien secondary
        },
        border: {
            subtle: "hsla(240, 62%, 58%, 0.2)",
            strong: "hsl(240, 62%, 58%)", // ancien border
        },
        state: {
            danger: "hsl(0, 83%, 65%)", // ancien error
            success: "hsl(159, 80%, 30%)",
            warning: "hsl(25, 88%, 40%)",
        },
        progressBar: {
            primary: { progress: "hsl(221, 83%, 53%)", back: "hsl(0, 0%, 100%)" },
            secondary: { progress: "hsl(221, 83%, 53%)", back: "hsl(0, 0%, 100%)" },
            success: { progress: "hsl(221, 83%, 53%)", back: "hsl(0, 0%, 100%)" },
        },
        tabBar: {
            background: "hsl(211, 74%, 94%)",
            border: "hsla(213, 98%, 61%, .15)",
            active: "hsl(213, 98%, 61%)",
            inactive: "hsla(213, 98%, 61%, .6)",
        },
        logo: {
            from: "hsl(223, 96%, 69%)",
            to: "hsl(248, 100%, 72%)",
            textFrom: "hsl(234, 42%, 73%)",
            textTo: "hsl(233, 62%, 58%)",
        },
    },
    shadow: { opacity: 0.14, color: "hsl(0, 0%, 0%)" },
    ...shared,
};

// Ancien « etheral »
export const darkTheme: Theme = {
    name: "dark",
    isDark: true,
    colors: {
        overlay: {
            white: "hsl(0, 0%, 100%)",
            black: "hsl(0, 0%, 0%)",
        },
        background: {
            screen: "hsl(230, 30%, 8%)", // ancien fond
            base: "hsl(240, 50%, 8%)", // ancien background.gradient[1]
            auth: "hsl(240, 28%, 10%)", // ancien background.login
            // J'ai supposé que 0.28 est la position de fin du dégradé : à vérifier.
            gradient: {
                colors: ["hsl(248, 73%, 29%)", "hsl(240, 50%, 8%)"],
                locations: [0, 0.28],
            },
        },
        surface: {
            card: "hsl(242, 33%, 18%)", // ancien secondary
            raised: "hsl(240, 18%, 45%)", // ancien case / bg3
            muted: "hsl(235, 53%, 18%)", // ancien pastel
            simpleOpacity: "hsl(0, 0%, 100%)",
        },
        text: {
            primary: "hsl(0, 0%, 100%)", // ancien contrast
            secondary: "hsl(240, 67%, 82%)",
            muted: "hsl(235, 51%, 65%)", // ancien inactive
            secondaryContrast: "hsl(217, 42%, 40%)",
            onPrimary: "hsl(0, 0%, 0%)", // ancien theme (noir sur le bleu clair)
        },
        brand: {
            primary: "hsl(228, 100%, 69%)", // ancien main
            accent: "hsl(234, 93%, 89%)", // ancien accent
            soft: "hsl(240, 34%, 38%)",
        },
        border: {
            subtle: "hsla(232, 94%, 67%, 0.25)",
            strong: "hsl(232, 94%, 67%)", // ancien border
        },
        state: {
            danger: "hsl(0, 83%, 65%)",
            success: "hsl(158, 64%, 52%)",
            warning: "hsl(27, 96%, 61%)",
        },
        progressBar: {
            primary: { progress: "hsl(221, 83%, 53%)", back: "hsl(0, 0%, 100%)" },
            secondary: { progress: "hsl(221, 83%, 53%)", back: "hsl(0, 0%, 100%)" },
            success: { progress: "hsl(221, 83%, 53%)", back: "hsl(0, 0%, 100%)" },
        },
        tabBar: {
            background: "hsl(240, 45%, 9%)",
            border: "hsl(240, 28%, 13%)",
            active: "hsl(234, 93%, 89%)",
            inactive: "hsl(235, 51%, 65%)",
        },
        logo: {
            from: "hsl(223, 100%, 85%)",
            to: "hsl(248, 100%, 86%)",
            textFrom: "hsl(234, 100%, 86%)",
            textTo: "hsl(233, 32%, 44%)",
        },
    },
    shadow: { opacity: 0.3, color: "hsl(0, 0%, 0%)" },
    ...shared,
};

export const THEMES: Record<ThemeName, Theme> = {
    light: lightTheme,
    dark: darkTheme,
};

// Alias : garde le nom utilisé par votre store, pour ne pas avoir à le modifier.
export const THEMES_ASSOCIATIONS = THEMES;

