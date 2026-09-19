import { radius, spacing, typography } from "./tokens";

export type ThemeName = "light" | "dark";

// Le type est LA source de vérité : un thème qui oublie une clé ne compile pas.
export type Theme = {
    name: ThemeName;
    isDark: boolean;
    colors: {
        background: {
            screen: string; // fond des écrans
            auth: string; // fond de l'écran de connexion
            // null = pas de dégradé, on utilise `screen`
            gradient: {
                colors: readonly [string, string];
                locations: readonly [number, number];
            } | null;
        };
        surface: {
            card: string; // cartes, listes, modales
            muted: string; // zones secondaires, champs
        };
        text: {
            primary: string;
            secondary: string;
            muted: string; // désactivé, placeholders
            onPrimary: string; // texte sur fond brand.primary
        };
        brand: {
            primary: string; // boutons, éléments actifs
            accent: string; // liens, chiffres mis en avant
            soft: string; // fonds teintés (badges, pastilles)
        };
        border: string;
        state: {
            danger: string;
            success: string;
            warning: string;
        };
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
        background: {
            screen: "rgb(222, 222, 250)", // ancien pastel / background.gradient
            auth: "rgb(230, 230, 255)", // ancien background.login
            gradient: null,
        },
        surface: {
            card: "rgb(255, 255, 255)", // ancien case
            muted: "rgb(238, 238, 255)", // à ajuster
        },
        text: {
            primary: "rgb(0, 0, 0)", // ancien contrast
            secondary: "rgb(70, 70, 140)", // à ajuster (contraste ≥ 4.5:1)
            muted: "rgb(140, 140, 215)", // ancien inactive
            onPrimary: "rgb(255, 255, 255)",
        },
        brand: {
            primary: "rgb(119, 119, 247)", // ancien main
            accent: "rgb(62, 62, 221)", // ancien accent
            soft: "rgb(180, 180, 253)", // ancien secondary
        },
        border: "rgba(80, 80, 214, 0.2)",
        state: {
            danger: "rgb(240, 90, 90)", // ancien error
            success: "#0F8A5F",
            warning: "#C2570C",
        },
        tabBar: {
            background: "rgb(255, 255, 255)",
            border: "rgba(80, 80, 214, 0.12)",
            active: "rgb(62, 62, 221)",
            inactive: "rgb(70, 70, 140)",
        },
        logo: {
            from: "#6691fc",
            to: "#8572ff",
            textFrom: "rgb(158, 164, 215)",
            textTo: "rgb(83, 98, 215)",
        },
    },
    shadow: { opacity: 0.14, color: "#000000" },
    ...shared,
};

// Ancien « etheral »
export const darkTheme: Theme = {
    name: "dark",
    isDark: true,
    colors: {
        background: {
            screen: "#0E101A", // ancien fond
            auth: "rgb(19, 19, 34)", // ancien background.login
            // J'ai supposé que 0.28 est la position de fin du dégradé : à vérifier.
            gradient: {
                colors: ["rgb(35, 20, 130)", "rgb(10, 10, 30)"],
                locations: [0, 0.28],
            },
        },
        surface: {
            card: "rgb(31, 30, 60)", // ancien secondary
            muted: "rgb(21, 25, 69)", // ancien pastel
        },
        text: {
            primary: "rgb(255, 255, 255)", // ancien contrast
            secondary: "rgb(180, 180, 240)",
            muted: "rgb(118, 125, 211)", // ancien inactive
            onPrimary: "rgb(255, 255, 255)",
        },
        brand: {
            primary: "rgb(97, 129, 255)", // ancien main
            accent: "rgb(199, 204, 253)", // ancien accent
            soft: "rgb(64, 64, 130)",
        },
        border: "rgba(92, 113, 250, 0.25)",
        state: {
            danger: "rgb(240, 90, 90)",
            success: "#34D399",
            warning: "#FB923C",
        },
        tabBar: {
            background: "rgb(12, 12, 32)",
            border: "rgb(23, 23, 41)",
            active: "rgb(199, 204, 253)",
            inactive: "rgb(118, 125, 211)",
        },
        logo: {
            from: "#B4C9FF",
            to: "#C1B7FF",
            textFrom: "rgb(186, 193, 255)",
            textTo: "rgb(77, 85, 149)",
        },
    },
    shadow: { opacity: 0.3, color: "#000000" },
    ...shared,
};

export const THEMES: Record<ThemeName, Theme> = {
    light: lightTheme,
    dark: darkTheme,
};

// Alias : garde le nom utilisé par votre store, pour ne pas avoir à le modifier.
export const THEMES_ASSOCIATIONS = THEMES;

