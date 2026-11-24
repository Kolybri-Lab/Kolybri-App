import { Theme } from "@/types";
import { withAlpha } from "./color";
import { radius, spacing, typography } from "./tokens";

const shared = { spacing, radius, typography };

const colors = {
    background: {
        /** Background of every regular screen. Also used for the nav header and tab bar. */
        app: "hsl(213, 74%, 94%)",
        /** Backdrop of modals, to elevate modal */
        modal: "hsla(213, 74%, 96%, .55)",
    },

    surface: {
        /** Default container: cards, modals, bottom sheets, list rows. */
        default: "hsl(0, 0%, 100%)",
        /** Emphasized container that must stand out from a card (highlighted block, selected tile). */
        raised: "hsl(212, 100%, 91%)",
        /** Quiet area inside a card or screen: input background, grouped section, skeleton. */
        muted: "hsl(213, 50%, 97%)",
    },

    text: {
        /** Body text, titles, labels. Default text color everywhere. */
        primary: "hsl(0, 0%, 0%)",
        /** Secondary text: descriptions, captions, timestamps, placeholders. */
        secondary: "hsl(0, 0%, 40%)",
        raised: "hsl(0, 0%, 70%)",
        /** Text and icons placed on brand.primary (filled buttons, active switch label). */
        onBrand: "hsl(0, 0%, 100%)",
    },

    brand: {
        /** Main interactive color: filled buttons, switch/checkbox/radio/slider active state, outline button text. */
        primary: "hsl(213, 85%, 54%)",
        /** Tinted soft background: chips, badges, selected list item, secondary button background. */
        soft: "hsl(213, 95%, 85%)",
        /** Large brand surfaces and illustrations: home header, avatar, hero. Not for buttons with small text. */
        vivid: "hsl(213, 89%, 72%)",
    },

    border: {
        /** Separators and light outlines: list dividers, card border, header and tab bar border. */
        subtle: "hsla(213, 62%, 58%, 0.2)",
        /** Outline of interactive elements: input border, outline button. Use brand.primary on focus, state.warning on error. */
        strong: "hsl(213, 62%, 58%)",
    },

    state: {
        /** Success confirmations, completed steps, positive values. */
        success: "hsl(159, 76%, 42%)",
        /** Errors, destructive actions, warnings, notification badge. */
        warning: "hsl(7, 81%, 46%)",
    },
};

export const lightTheme: Theme = {
    name: "light",
    isDark: false,
    colors,
    components: {
        /** Values used only by the bottom tab bar. */
        tabBar: {
            /** Tab bar background (same as the screens). */
            background: colors.background.app,
            /** Top border of the tab bar. */
            border: withAlpha(colors.brand.primary, 0.15),
            /** Icon and label of the selected tab. */
            active: colors.brand.primary,
            /** Icon and label of unselected tabs. */
            inactive: withAlpha(colors.brand.primary, 0.45),
        },
        /** Values used only by progress bars. */
        progressBar: {
            /** Filled part of the bar. */
            progress: colors.brand.primary,
            /** Empty part of the bar. */
            track: colors.surface.default,
        },
    },
    logo: {
        /** Logo icon gradient, start. */
        from: "hsl(223, 90%, 65%)",
        /** Logo icon gradient, end. */
        to: "hsl(213, 81%, 90%)",
        /** Logo wordmark gradient, start. */
        textFrom: "hsl(213, 81%, 90%)",
        /** Logo wordmark gradient, end. */
        textTo: "hsl(223, 90%, 65%)",
    },
    ...shared,
};

