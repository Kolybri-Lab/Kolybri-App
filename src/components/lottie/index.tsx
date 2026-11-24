import { forwardRef, useMemo } from "react";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import type { Theme } from "@/types";
import AnimatedLottie, {
    type AnimatedLottieHandle,
    type AnimatedLottieProps,
} from "../display/AnimatedLottie";
import {
    recolorLottie,
    type LottieColorMap,
    type LottieJson,
} from "./recolorLottie";

import kolybriFreeJson from "assets/lottie/00_anim_free_tier3_1.json";
import kolybriFrontTier1_1Json from "assets/lottie/00_anim_front_tier1_1.json";
import kolybriFrontTier1_2Json from "assets/lottie/00_anim_front_tier1_2.json";
import kolybriFrontTier2_1Json from "assets/lottie/00_anim_front_tier2_1.json";
import kolybriInclineTier1_1Json from "assets/lottie/00_anim_incline_tier1_1.json";
import kolybriInclineTier1_2Json from "assets/lottie/00_anim_incline_tier1_2.json";
import kolybriInclineTier1_3Json from "assets/lottie/00_anim_incline_tier1_3.json";
import kolybriInclineTier2_1Json from "assets/lottie/00_anim_incline_tier2_1.json";
import kolybriProfileTier1_1Json from "assets/lottie/00_anim_profile_tier1_1.json";
import kolybriProfileTier1_2Json from "assets/lottie/00_anim_profile_tier1_2.json";
import kolybriProfileTier1_3Json from "assets/lottie/00_anim_profile_tier1_3.json";
import failJson from "assets/lottie/Fail.json";
import loading1Json from "assets/lottie/Loading1.json";
import loading2Json from "assets/lottie/Loading2.json";
import sendingCheckJson from "assets/lottie/Sending Check.json";
import successJson from "assets/lottie/Success.json";
import winnerBadgeJson from "assets/lottie/Winner Badge.json";
import flammeJson from "assets/lottie/flamme.json";
import flamme2Json from "assets/lottie/flamme2.json";
import loaderJson from "assets/lottie/loader.json";

export type { AnimatedLottieHandle, LottieColorMap };

export type ThemedLottieProps = Omit<AnimatedLottieProps, "source"> & {
    /** Quick override for monochrome Lotties (equivalent to colorMap={{ "*": color }}) */
    color?: string;
    /** Fine-grained override per source color or layer name (merged on top of the default theme map) */
    colorMap?: LottieColorMap;
};

type ColorResolver = (theme: Theme) => LottieColorMap;

function createLottie(source: LottieJson, getColors?: ColorResolver) {
    const Component = forwardRef<AnimatedLottieHandle, ThemedLottieProps>(
        function ThemedLottie({ color, colorMap, ...props }, ref) {
            const theme = useTheme();

            const themedSource = useMemo(() => {
                const baseMap = getColors ? getColors(theme) : undefined;
                const mergedMap: LottieColorMap | undefined = color
                    ? { "*": color }
                    : baseMap || colorMap
                      ? { ...baseMap, ...colorMap }
                      : undefined;
                return recolorLottie(source, mergedMap);
            }, [theme, color, colorMap]);

            return (
                <AnimatedLottie
                    ref={ref}
                    source={themedSource as AnimatedLottieProps["source"]}
                    {...props}
                />
            );
        }
    );

    return Component;
}

// ─── Lottie registry & theme bindings ────────────────────────────────────────

// UI / States
export const LoaderLottie = createLottie(loaderJson, ({ colors }) => ({
    "*": colors.brand.primary,
}));

export const ToggleLoading1Lottie = createLottie(loading1Json, ({ colors }) => ({
    "*": colors.text.raised,
}));

export const ToggleLoading2Lottie = createLottie(loading2Json, ({ colors }) => ({
    "*": colors.text.raised,
}));

export const ToggleSuccessLottie = createLottie(successJson, ({ colors }) => ({
    "*": colors.state.success,
}));

export const ToggleFailLottie = createLottie(failJson, ({ colors }) => ({
    "*": colors.state.warning,
}));

export const SendingCheckLottie = createLottie(sendingCheckJson, ({ colors }) => ({
    "#36b26f": colors.state.success,
    "#70c396": withAlpha(colors.state.success, 0.7),
    "#ffffff": colors.text.onBrand,
}));

// Illustrations
export const WinnerBadgeLottie = createLottie(winnerBadgeJson, ({ colors }) => ({
    "#ea581f": "#ea581f", // leaves + number 1
    "#fc9a13": "#fc9a13", // badge circle
    "#073c5c": "#073c5c", // blue background circle
    "#000000": "#000000", // shadow
    // Note: also contains gradients (Badge Circle, Ribben, Bg Circle) not handled by recolorLottie
}));

export const FlameOrangeLottie = createLottie(flammeJson, ({ colors }) => ({
    "#f28a31": "#f28a31", // outer flame
    "#f7a962": "#f7a962", // middle flame
    "#f5bb86": "#f5bb86", // flame core
    "#3b3347": "#3b3347", // dark details / outlines
}));

export const FlamePurpleLottie = createLottie(flamme2Json, ({ colors }) => ({
    "#b768d4": "#b768d4", // outer flame
    "#bd92e8": "#bd92e8", // middle flame
    "#cbb1e5": "#cbb1e5", // flame core
}));

// Kolybri (shared palette across all 11 animations)
const getKolybriColors = (colors: Theme["colors"]): LottieColorMap => ({
    "#3a92fd": colors.brand.primary, // body
    "#9bc8fd": colors.brand.vivid, // wings
    "#034392": "#034392", // beak / dark details
    "#ffffff": "#ffffff", // eyes / white highlights
});

const kolybriColors: ColorResolver = ({ colors }) => getKolybriColors(colors);

export const KolybriFreeLottie = createLottie(kolybriFreeJson, ({ colors }) => ({
    ...getKolybriColors(colors),
    "01_cmp_free_item_halo": colors.surface.default, // large background circle (80% opacity in JSON)
    "#fbbf24": "#fbbf24", // yellow props (gamepad / stars)
    "#000000": "#000000", // black details (gamepad / football)
}));

export const KolybriFrontTier1_1Lottie = createLottie(kolybriFrontTier1_1Json, kolybriColors);
export const KolybriFrontTier1_2Lottie = createLottie(kolybriFrontTier1_2Json, kolybriColors);
export const KolybriFrontTier2_1Lottie = createLottie(kolybriFrontTier2_1Json, ({ colors }) => ({
    ...getKolybriColors(colors),
    "#f28a31": "#f28a31", // outer flame
    "#f7a962": "#f7a962", // middle flame
    "#f5bb86": "#f5bb86", // flame core
    "#fbbf24": "#fbbf24", // glow halo (Flame_Glow_Halo)
}));
export const KolybriInclineTier1_1Lottie = createLottie(kolybriInclineTier1_1Json, kolybriColors);
export const KolybriInclineTier1_2Lottie = createLottie(kolybriInclineTier1_2Json, kolybriColors);
export const KolybriInclineTier1_3Lottie = createLottie(kolybriInclineTier1_3Json, kolybriColors);
export const KolybriInclineTier2_1Lottie = createLottie(kolybriInclineTier2_1Json, kolybriColors);
export const KolybriProfileTier1_1Lottie = createLottie(kolybriProfileTier1_1Json, kolybriColors);
export const KolybriProfileTier1_2Lottie = createLottie(kolybriProfileTier1_2Json, kolybriColors);
export const KolybriProfileTier1_3Lottie = createLottie(kolybriProfileTier1_3Json, kolybriColors);
