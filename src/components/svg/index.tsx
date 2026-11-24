import type { FC } from "react";
import Svg, { Path, Text as SvgText, type SvgProps } from "react-native-svg";
import { useTheme } from "@/hooks/useThemeStore";
import type { Theme } from "@/types";

import BestGradeSvg from "assets/svg/badges/best-grade.svg";
import EqualToDisciplineAverageSvg from "assets/svg/badges/equal-to-discipline-average.svg";
import MaxGradeSvg from "assets/svg/badges/max-grade.svg";
import UpTheStreakSvg from "assets/svg/badges/up-the-streak.svg";
import UpperThanClassAverageSvg from "assets/svg/badges/upper-than-class-average.svg";
import UpperThanDisciplineAverageSvg from "assets/svg/badges/upper-than-discipline-average.svg";

import FrenchFlagSvg from "assets/svg/flags/french-flag.svg";

import DiscordSvg from "assets/svg/logos/discord.svg";
import GithubSvg from "assets/svg/logos/github.svg";
import KolybriSvg from "assets/svg/logos/kolybri.svg";

import AccountSvg from "assets/svg/icons/account.svg";
import AtSvg from "assets/svg/icons/at.svg";
import BackArrowSvg from "assets/svg/icons/back-arrow.svg";
import BellOffSvg from "assets/svg/icons/bell-off.svg";
import CheckSvg from "assets/svg/icons/check.svg";
import ChevronSvg from "assets/svg/icons/chevron.svg";
import ClockSvg from "assets/svg/icons/clock.svg";
import CopyLeftSvg from "assets/svg/icons/copy-left.svg";
import CrossSvg from "assets/svg/icons/cross.svg";
import DoorOpenSvg from "assets/svg/icons/door-open.svg";
import GradeArrowSvg from "assets/svg/icons/grade-arrow.svg";
import GraduationCapSvg from "assets/svg/icons/graduation-cap.svg";
import HourglassSvg from "assets/svg/icons/hourglass.svg";
import InfoSvg from "assets/svg/icons/info.svg";
import KeySvg from "assets/svg/icons/key.svg";
import LightningSvg from "assets/svg/icons/lightning.svg";
import LinkSvg from "assets/svg/icons/link.svg";
import MenuSvg from "assets/svg/icons/menu.svg";
import MergeSvg from "assets/svg/icons/merge.svg";
import MoonSvg from "assets/svg/icons/moon.svg";
import PenSquareSvg from "assets/svg/icons/pen-square.svg";
import PeoplesSvg from "assets/svg/icons/peoples.svg";
import PersonSvg from "assets/svg/icons/person.svg";
import PhoneSvg from "assets/svg/icons/phone.svg";
import PlusSvg from "assets/svg/icons/plus.svg";
import PowerSvg from "assets/svg/icons/power.svg";
import RoadFinishSvg from "assets/svg/icons/road-finish.svg";
import SafetyShieldSvg from "assets/svg/icons/safety-shield.svg";
import SearchSvg from "assets/svg/icons/search.svg";
import SimpleArrowSvg from "assets/svg/icons/simple-arrow.svg";
import StarSvg from "assets/svg/icons/star.svg";
import SunSvg from "assets/svg/icons/sun.svg";
import TrashSvg from "assets/svg/icons/trash.svg";

import {
    GradesSvg,
    HomeSvg,
    HomeworksSvg,
    MessagingSvg,
    TimetableSvg,
} from "./navigation";

export type ThemedSvgProps = Omit<SvgProps, "width" | "height" | "color"> & {
    size?: number;
    width?: SvgProps["width"];
    height?: SvgProps["height"];
    color?: string;
    /** Alias for `color` (legacy callers using `fill={...}`). */
    fill?: string;
    /** Alias for `color` (legacy callers using `stroke={...}`). */
    stroke?: string;
    /** Legacy prop bag (e.g. `props={{ transform: ... }}`). */
    props?: Record<string, any>;
};

type SvgOptions = {
    defaultSize?: number;
    defaultWidth?: number;
    defaultHeight?: number;
    defaultStyle?: SvgProps["style"];
    getColor?: (theme: Theme) => string;
};

function createSvg(
    SvgComponent: FC<SvgProps>,
    {
        defaultSize = 30,
        defaultWidth,
        defaultHeight,
        defaultStyle,
        getColor,
    }: SvgOptions = {}
) {
    return function ThemedSvg({
        size,
        width,
        height,
        color,
        fill,
        stroke,
        props: legacyProps,
        style,
        ...rest
    }: ThemedSvgProps) {
        const theme = useTheme();
        const resolvedColor =
            color ?? fill ?? stroke ?? (getColor ? getColor(theme) : undefined);
        const resolvedWidth = width ?? size ?? defaultWidth ?? defaultSize;
        const resolvedHeight = height ?? size ?? defaultHeight ?? defaultSize;
        const mergedStyle = defaultStyle ? [defaultStyle, style] : style;

        return (
            <SvgComponent
                width={resolvedWidth}
                height={resolvedHeight}
                {...(resolvedColor ? { color: resolvedColor } : undefined)}
                {...(mergedStyle !== undefined ? { style: mergedStyle } : undefined)}
                {...legacyProps}
                {...rest}
            />
        );
    };
}

const textPrimary = ({ colors }: Theme) => colors.text.primary;
const brandPrimary = ({ colors }: Theme) => colors.brand.primary;
const tabActive = ({ components }: Theme) => components.tabBar.active;

// Badges (multicolor)
export const BestGrade = createSvg(BestGradeSvg, { defaultSize: 100 });
export const EqualToDisciplineAverage = createSvg(EqualToDisciplineAverageSvg, { defaultSize: 100 });
export const MaxGrade = createSvg(MaxGradeSvg, { defaultSize: 100 });
export const UpTheStreak = createSvg(UpTheStreakSvg, { defaultSize: 100 });
export const UpperThanClassAverage = createSvg(UpperThanClassAverageSvg, { defaultSize: 100 });
export const UpperThanDisciplineAverage = createSvg(UpperThanDisciplineAverageSvg, { defaultSize: 100 });

// Flags (multicolor)
export const FrenchFlag = createSvg(FrenchFlagSvg, { defaultSize: 30 });

// Logos
export const Discord = createSvg(DiscordSvg, { getColor: textPrimary });
export const Github = createSvg(GithubSvg, { getColor: textPrimary });
export const Kolybri = createSvg(KolybriSvg);

// Navigation (keep <Filter>/<FeDropShadow> in ./navigation)
export const GradesIcon = createSvg(GradesSvg, { getColor: tabActive });
export const HomeIcon = createSvg(HomeSvg, { getColor: tabActive });
export const HomeworksIcon = createSvg(HomeworksSvg, { getColor: tabActive });
export const MessagingIcon = createSvg(MessagingSvg, { getColor: tabActive });
export const TimetableIcon = createSvg(TimetableSvg, { getColor: tabActive });

// Icons
export const Account = createSvg(AccountSvg, { getColor: brandPrimary });
export const At = createSvg(AtSvg, { getColor: textPrimary });
export const BackArrow = createSvg(BackArrowSvg, { getColor: textPrimary });
export const BellOff = createSvg(BellOffSvg, { getColor: textPrimary });
export const Check = createSvg(CheckSvg, { getColor: brandPrimary });
export const Chevron = createSvg(ChevronSvg, { getColor: textPrimary });
export const Clock = createSvg(ClockSvg, { getColor: textPrimary });
export const CopyLeft = createSvg(CopyLeftSvg, { getColor: textPrimary });
export const Cross = createSvg(CrossSvg, { getColor: textPrimary });
export const DoorOpen = createSvg(DoorOpenSvg, { getColor: textPrimary });
export const GraduationCap = createSvg(GraduationCapSvg, { getColor: textPrimary });
export const Hourglass = createSvg(HourglassSvg, { getColor: textPrimary });
export const Info = createSvg(InfoSvg, { getColor: textPrimary });
export const Key = createSvg(KeySvg, { getColor: brandPrimary });
export const Lightning = createSvg(LightningSvg, { getColor: textPrimary });
export const Link = createSvg(LinkSvg, {
    getColor: textPrimary,
    defaultStyle: { transform: [{ rotate: "320deg" }] },
});
export const Menu = createSvg(MenuSvg, { getColor: textPrimary });
export const Merge = createSvg(MergeSvg, { getColor: textPrimary });
export const Moon = createSvg(MoonSvg, { getColor: textPrimary });
export const PenSquare = createSvg(PenSquareSvg, { getColor: textPrimary });
export const Peoples = createSvg(PeoplesSvg, { getColor: textPrimary });
export const Person = createSvg(PersonSvg, { getColor: textPrimary });
export const Phone = createSvg(PhoneSvg, { getColor: textPrimary });
export const Plus = createSvg(PlusSvg, { getColor: textPrimary });
export const Power = createSvg(PowerSvg, { getColor: textPrimary });
export const RoadFinish = createSvg(RoadFinishSvg, { getColor: textPrimary });
export const SafetyShield = createSvg(SafetyShieldSvg, { getColor: textPrimary });
export const Search = createSvg(SearchSvg, { getColor: textPrimary });
export const SimpleArrow = createSvg(SimpleArrowSvg, { getColor: textPrimary });
export const Star = createSvg(StarSvg, { getColor: textPrimary });
export const Sun = createSvg(SunSvg, { getColor: textPrimary });
export const Trash = createSvg(TrashSvg, { getColor: textPrimary });

const BaseGradeArrow = createSvg(GradeArrowSvg, {
    defaultWidth: 23,
    defaultHeight: 40,
    getColor: textPrimary,
});

export function GradeArrow({
    miroired = false,
    style,
    ...rest
}: ThemedSvgProps & { miroired?: boolean }) {
    return (
        <BaseGradeArrow
            style={[miroired && { transform: [{ scaleX: -1 }] }, style]}
            {...rest}
        />
    );
}

export function File({
    size = 100,
    width,
    height,
    color,
    fill,
    stroke,
    extention = "pdf",
    props: legacyProps,
    ...rest
}: ThemedSvgProps & { extention?: string }) {
    const { colors } = useTheme();
    const resolvedColor = color ?? fill ?? stroke ?? colors.text.primary;

    return (
        <Svg
            width={width ?? size}
            height={height ?? size}
            viewBox="0 0 100 100"
            fill="none"
            {...legacyProps}
            {...rest}
        >
            <Path
                d="M87 35H91C91 33.9391 90.5786 32.9217 89.8284 32.1716L87 35ZM56 4L58.8284 1.17157C58.0783 0.421427 57.0609 0 56 0V4ZM23 100H77V92H23V100ZM89.8284 32.1716L58.8284 1.17157L53.1716 6.82843L84.1716 37.8284L89.8284 32.1716ZM56 0H23V8H56V0ZM52 4V25H60V4H52ZM66 39H87V31H66V39ZM9 14V50H17V14H9ZM91 86V81H83V86H91ZM91 50V35H83V50H91ZM9 81V86H17V81H9ZM13 85H87V77H13V85ZM87 46H13V54H87V46ZM13 46H5V54H13V46ZM0 51V80H8V51H0ZM5 85H13V77H5V85ZM87 85H95V77H87V85ZM100 80V51H92V80H100ZM95 46H87V54H95V46ZM100 51C100 48.2386 97.7614 46 95 46V54C93.3431 54 92 52.6569 92 51H100ZM77 100C84.732 100 91 93.732 91 86H83C83 89.3137 80.3137 92 77 92V100ZM95 85C97.7614 85 100 82.7614 100 80H92C92 78.3431 93.3431 77 95 77V85ZM23 92C19.6863 92 17 89.3137 17 86H9C9 93.732 15.268 100 23 100V92ZM5 46C2.23858 46 0 48.2386 0 51H8C8 52.6569 6.65685 54 5 54V46ZM52 25C52 32.732 58.268 39 66 39V31C62.6863 31 60 28.3137 60 25H52ZM0 80C0 82.7614 2.23857 85 5 85V77C6.65686 77 8 78.3431 8 80H0ZM23 0C15.268 0 9 6.26801 9 14H17C17 10.6863 19.6863 8 23 8V0Z"
                fill={resolvedColor}
            />
            <SvgText
                x="24.75"
                y="74"
                fill={resolvedColor}
                fontSize="30"
                fontWeight={900}
            >
                {extention}
            </SvgText>
        </Svg>
    );
}
