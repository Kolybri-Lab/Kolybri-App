import { Theme } from "@/types";
import { radius, spacing, typography } from "./tokens";
const shared = { spacing, radius, typography };

const colors = {
    background: {
        /** Background of every regular screen. Also used for the nav header and tab bar. */
        app: "hsl(211, 74%, 94%)",
        /** Background of auth screens (login, sign up, forgot password). */
        auth: "hsl(240, 100%, 95%)",
    },

    surface: {
        /** Default container: cards, modals, bottom sheets, list rows. */
        default: "hsl(0, 0%, 100%)",
        /** Emphasized container that must stand out from a card (highlighted block, selected tile). */
        raised: "hsl(215, 100%, 87%)",
        /** Quiet area inside a card or screen: input background, grouped section, skeleton. */
        muted: "hsl(240, 100%, 97%)",
    },

    text: {
        /** Body text, titles, labels. Default text color everywhere. */
        primary: "hsl(0, 0%, 0%)",
        /** Secondary text: descriptions, captions, timestamps, placeholders. */
        secondary: "hsl(0, 0%, 38%)",
        /** Blue text for large or bold text only (contrast ~3:1 on white). Not for small body text or links. */
        accent: "hsl(213, 98%, 61%)",
        /** Brand-colored text on light surfaces: titles, links, checkbox labels, active chips (~7:1 on white). */
        brand: "hsl(240, 70%, 55%)",
        /** Text and icons placed on brand.primary (filled buttons, active switch label). */
        onBrand: "hsl(0, 0%, 100%)",
    },

    brand: {
        /** Main interactive color: filled buttons, switch/checkbox/radio/slider active state, outline button text. */
        primary: "hsl(240, 70%, 55%)",
        /** Tinted soft background: chips, badges, selected list item, secondary button background. */
        soft: "hsl(240, 95%, 85%)",
        /** Large brand surfaces and illustrations: home header, avatar, hero. Not for buttons with small text. */
        vivid: "hsl(240, 89%, 72%)",
        /** Decorative blue, never as text color: active tab, accent icons, progress bar. */
        highlight: "hsl(213, 98%, 61%)",
    },

    border: {
        /** Separators and light outlines: list dividers, card border, header and tab bar border. */
        subtle: "hsla(240, 62%, 58%, 0.2)",
        /** Outline of interactive elements: input border, outline button. Use brand.primary on focus, state.danger on error. */
        strong: "hsl(240, 62%, 58%)",
    },

    state: {
        /** Errors, destructive actions, invalid input, notification badge. */
        danger: "hsl(0, 83%, 65%)",
        /** Success confirmations, completed steps, positive values. */
        success: "hsl(159, 80%, 30%)",
        /** Warnings and non-blocking alerts. */
        warning: "hsl(25, 88%, 40%)",
    },
};

export const darkTheme: Theme = {
    name: "dark",
    isDark: true,
    colors,
    components: {
        /** Values used only by the bottom tab bar. */
        tabBar: {
            /** Tab bar background (same as the screens). */
            background: colors.background.app,
            /** Top border of the tab bar. */
            border: "hsla(213, 98%, 61%, .15)",
            /** Icon and label of the selected tab. */
            active: colors.brand.highlight,
            /** Icon and label of unselected tabs. */
            inactive: "hsla(213, 98%, 61%, .6)",
        },
        /** Values used only by progress bars. */
        progressBar: {
            /** Filled part of the bar. */
            progress: colors.brand.highlight,
            /** Empty part of the bar. */
            track: colors.surface.default,
        },
    },
    logo: {
        /** Logo icon gradient, start. */
        from: "hsl(223, 96%, 69%)",
        /** Logo icon gradient, end. */
        to: "hsl(248, 100%, 72%)",
        /** Logo wordmark gradient, start. */
        textFrom: "hsl(234, 42%, 73%)",
        /** Logo wordmark gradient, end. */
        textTo: "hsl(233, 62%, 58%)",
    },
    ...shared,
};

