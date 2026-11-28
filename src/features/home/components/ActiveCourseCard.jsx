import { Text } from "@/components";
import { ProgressBar } from "@/components/progression/ProgressBar";
import { BackArrow } from "@/components/svg";
import { useTimetable } from "@/features/timetable";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import {
    convertTimeHoursMinToMinutes,
    isAfter,
    isBefore,
    isInInterval,
} from "@/utils/time";
import { useNavigation } from "@react-navigation/native";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";

export default function ActiveCourseCard() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const haptic = useHaptic("medium");

    const token = useUserStore((state) => state.token);
    const { data: allWeeks, isLoading } = useTimetable(token);
    const currentTime = useCurrentTime();

    const allDays = useMemo(() => {
        if (!Array.isArray(allWeeks)) return [];
        return allWeeks.flatMap((w) => w.days || []);
    }, [allWeeks]);

    const activeDay = useMemo(() => {
        return allDays.find((d) => d.date === currentTime.date) ?? null;
    }, [allDays, currentTime.date]);

    const todayCourses = useMemo(() => {
        if (!activeDay?.courses) return [];
        return activeDay.courses.filter((c) => !c.states?.cancelled);
    }, [activeDay]);

    const activeCourse = useMemo(() => {
        if (todayCourses.length === 0) return null;
        return (
            todayCourses.find((course) =>
                isInInterval(
                    currentTime.time,
                    course.schedules.start.time,
                    course.schedules.end.time
                )
            ) ?? null
        );
    }, [todayCourses, currentTime.time]);

    const progression = useMemo(() => {
        if (!activeCourse) return 0;
        const [activeMinutes, startMinutes, endMinutes] =
            convertTimeHoursMinToMinutes(
                currentTime.time,
                activeCourse.schedules.start.time,
                activeCourse.schedules.end.time
            );
        if (endMinutes <= startMinutes) return 0;
        const progress =
            (activeMinutes - startMinutes) / (endMinutes - startMinutes);
        return Math.min(Math.max(parseFloat(progress.toFixed(4)), 0), 1);
    }, [activeCourse, currentTime.time]);

    const { nextCourse, isLastCourseOfTheDay } = useMemo(() => {
        if (todayCourses.length === 0) {
            const followingDay = allDays.find(
                (d) =>
                    d.date > currentTime.date &&
                    d.courses.some((c) => !c.states?.cancelled)
            );
            const nextC =
                followingDay?.courses.find((c) => !c.states?.cancelled) ?? null;
            return { nextCourse: nextC, isLastCourseOfTheDay: false };
        }

        const firstCourse = todayCourses[0];
        const lastCourse = todayCourses[todayCourses.length - 1];

        const activeCourseIndex = activeCourse
            ? todayCourses.findIndex((c) => c.id === activeCourse.id)
            : -1;

        const isLast =
            activeCourseIndex !== -1 &&
            activeCourseIndex === todayCourses.length - 1;

        // 1. Avant le début des cours de la journée
        if (isBefore(currentTime.time, firstCourse.schedules.start.time)) {
            return {
                nextCourse: firstCourse,
                isLastCourseOfTheDay: todayCourses.length === 1,
            };
        }

        // 2. Pendant une pause / récréation
        if (
            !activeCourse &&
            isInInterval(
                currentTime.time,
                firstCourse.schedules.start.time,
                lastCourse.schedules.end.time
            )
        ) {
            const nextC =
                todayCourses.find((c) =>
                    isAfter(c.schedules.start.time, currentTime.time)
                ) ?? null;
            return {
                nextCourse: nextC,
                isLastCourseOfTheDay: nextC?.id === lastCourse.id,
            };
        }

        // 3. En plein cours et ce n'est pas le dernier
        if (activeCourse && !isLast) {
            return {
                nextCourse: todayCourses[activeCourseIndex + 1],
                isLastCourseOfTheDay: false,
            };
        }

        // 4. Dernier cours en cours ou fin de journée de cours
        const followingDay = allDays.find(
            (d) =>
                d.date > currentTime.date &&
                d.courses.some((c) => !c.states?.cancelled)
        );
        const nextC =
            followingDay?.courses.find((c) => !c.states?.cancelled) ?? null;

        return {
            nextCourse: nextC,
            isLastCourseOfTheDay: isLast,
        };
    }, [todayCourses, allDays, activeCourse, currentTime]);

    const inClass = Boolean(activeCourse);
    const nextCourseKnown = Boolean(nextCourse);

    if (isLoading && (!allWeeks || allWeeks.length === 0)) {
        return null;
    }

    const message = nextCourseKnown ? "EN COURS" : "DERNIER COURS CONNU";

    return (
        <View style={{ width: "100%", gap: 8 }}>
            {inClass && (
                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            paddingHorizontal: 6,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: colors.brand.primary,
                                width: 6,
                                height: 6,
                                borderRadius: 5,
                            }}
                        />
                        <Text
                            preset="badge.md"
                            size={16}
                            color={colors.brand.primary}
                        >
                            {isLastCourseOfTheDay
                                ? "DERNIER COURS DE LA JOURNÉE !"
                                : message}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            haptic();
                            navigation.navigate(routesNames.client.timetable.group, {
                                screen: routesNames.client.timetable.content,
                            });
                        }}
                        style={{ width: "100%" }}
                    >
                        <Course
                            course={activeCourse}
                            progression={progression}
                            isLast={isLastCourseOfTheDay}
                        />
                    </TouchableOpacity>
                </View>
            )}
            {nextCourseKnown && (
                <View>
                    {/*{!inClass && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginLeft: 6,
                            }}
                        >
                            <Text preset="badge.md" size={16}>
                                PROCHAIN COURS
                            </Text>
                        </View>
                    )}*/}
                    <TouchableOpacity
                        onPress={() => {
                            haptic();
                            navigation.navigate(routesNames.client.timetable.group, {
                                screen: routesNames.client.timetable.content,
                            });
                        }}
                        style={{ width: "100%" }}
                    >
                        <NextCourse course={nextCourse} inClass={inClass} />
                    </TouchableOpacity>
                </View>
            )}
            {!inClass && !nextCourseKnown && <AnyCourse />}
        </View>
    );
}

const Course = ({ course, progression, isLast }) => {
    const { colors, components } = useTheme();
    const textColor = withAlpha(colors.text.primary, 0.9);

    return (
        <View
            style={{
                width: "100%",
                height: 70,
                flex: 1,
                flexDirection: "row",
                backgroundColor: colors.surface.raised,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottomLeftRadius: isLast ? 16 : 4,
                borderBottomRightRadius: isLast ? 16 : 4,
            }}
        >
            <View
                style={{
                    width: 64,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    preset="meta.md"
                    color={colors.text.secondary}
                    style={{ lineHeight: 18 }}
                >
                    {course.schedules.start.time}
                </Text>
                <View
                    style={{
                        width: 2,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: colors.border.subtle,
                    }}
                />
                <Text
                    preset="meta.md"
                    color={colors.text.secondary}
                    style={{ lineHeight: 18 }}
                >
                    {course.schedules.end.time}
                </Text>
            </View>

            <View
                style={{
                    flex: 1,
                    paddingTop: 12,
                    paddingLeft: 24,
                    paddingRight: 16,
                    gap: 4,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                    }}
                >
                    <Text
                        preset="cardTitle.lg"
                        oneLine
                        color={textColor}
                        style={{ flexShrink: 1 }}
                    >
                        {course.libelle}
                    </Text>

                    <View
                        style={{
                            flexShrink: 0,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <BackArrow
                            props={{ transform: [{ rotate: "180deg" }] }}
                            fill={colors.text.secondary}
                            size={22}
                        />
                        <Text
                            preset="meta.md"
                            size={16}
                            color={colors.text.secondary}
                        >
                            {course.schedules.end.time}
                        </Text>
                    </View>
                </View>

                <ProgressBar
                    progression={progression}
                    color={components.progressBar.progress}
                    style={{
                        backgroundColor: components.progressBar.track,
                        height: 10,
                    }}
                />
            </View>
        </View>
    );
};

const NextCourse = ({ course, inClass }) => {
    const { colors } = useTheme();

    return (
        <View
            style={{
                width: "100%",
                height: 70,
                flex: 1,
                flexDirection: "row",
                backgroundColor: colors.surface.default,
                borderTopLeftRadius: inClass ? 4 : 16,
                borderTopRightRadius: inClass ? 4 : 16,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
            }}
        >
            <View
                style={{
                    width: 64,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    preset="meta.md"
                    color={colors.text.secondary}
                    style={{ lineHeight: 18 }}
                >
                    {course.schedules.start.time}
                </Text>
                <View
                    style={{
                        width: 2,
                        height: 8,
                        borderRadius: 2,
                        backgroundColor: colors.text.secondary,
                    }}
                />
                <Text
                    preset="meta.md"
                    color={colors.text.secondary}
                    style={{ lineHeight: 18 }}
                >
                    {course.schedules.end.time}
                </Text>
            </View>

            <View
                style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingLeft: 24,
                    paddingRight: 16,
                    justifyContent: "center",
                    gap: 2,
                }}
            >
                <Text preset="cardTitle.lg" oneLine>
                    {course.libelle}
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Text
                        preset="meta.md"
                        oneLine
                        color={colors.text.secondary}
                        style={{ flexShrink: 1 }}
                    >
                        {course.teacher ?? "Pas de prof."}
                    </Text>
                    <Text
                        preset="meta.md"
                        oneLine
                        color={colors.text.secondary}
                        style={{ flexShrink: 0 }}
                    >
                        {course.room ?? "Aucune salle"}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const AnyCourse = () => {
    const { colors } = useTheme();

    return (
        <View
            style={{
                width: "100%",
                minHeight: 90,
                backgroundColor: colors.surface.default,
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
            }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.brand.soft,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Text preset="heading.page">🎉</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text
                    preset="cardTitle.lg"
                    size={17}
                    style={{ marginBottom: 2 }}
                >
                    Aucun cours pour le moment
                </Text>
                <Text
                    preset="body.md"
                    color={withAlpha(colors.text.primary, 0.6)}
                >
                    Profites-en pour souffler un peu 😌
                </Text>
            </View>
        </View>
    );
};

