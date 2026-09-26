import { ScreenStack, SharePopup, Text } from "@/components";
import { useGrades } from "@/features/grades";
import ActiveCourseCard from "@/features/home/components/ActiveCourseCard";
import GeneralAveragePreview from "@/features/home/components/GeneralAveragePreview";
import HomeworksPreview from "@/features/home/components/HomeworksPreview";
import LastGrades from "@/features/home/components/LastGrades";
import getGreetingMessage from "@/features/home/utils/getGreetingMessage";
import { useHomeworks } from "@/features/homeworks";
import { useTimetable } from "@/features/timetable";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { useSignIn } from "@/hooks/useSignIn";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { GuestTestButtons } from "@/mock/guest/components";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { getTodayDateString } from "@/utils/date";
import { objectsEqual } from "@/utils/json";
import {
    convertTimeHoursMinToMinutes,
    getTimeInterval,
    isAfter,
    isBefore,
    isInInterval,
} from "@/utils/time";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const { signOut } = useSignIn();
    const navigation = useNavigation();
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const profile = useUserStore((state) => state.profile);

    const [greetingMessage] = useState(getGreetingMessage);

    const hasHydrated = useUserStore((s) => s.hasHydrated);
    const isFirstLaunch = useUserStore((s) => s.isFirstLaunch);
    const markLaunched = useUserStore((s) => s.markLaunched);
    const [showPopup, setShowPopup] = useState(false);

    const name = profile?.name ?? "";
    const { data: timetableData } = useTimetable(token);
    const { data: gradesData } = useGrades(token);
    const { data: homeworksData } = useHomeworks(token);

    const localPhotoUri = profile?.localPhotoUri;

    const customDataStore = useCustomDataStore();
    const currentTime = useCurrentTime();

    useEffect(() => {
        if (hasHydrated && isFirstLaunch) {
            const timer = setTimeout(() => setShowPopup(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [hasHydrated, isFirstLaunch]);

    const handleClosePopup = () => {
        setShowPopup(false);
        markLaunched();
    };

    const getProfileImageSource = useCallback(
        () =>
            localPhotoUri
                ? { uri: localPhotoUri }
                : require("../../../../assets/custom/default-user-picture.png"),
        [localPhotoUri]
    );

    const activeDate = useMemo(() => {
        if (!Array.isArray(timetableData)) return null;
        return (
            timetableData.find(({ date }) => date === getTodayDateString()) ?? null
        );
    }, [timetableData]);

    const activeCourse = useMemo(() => {
        if (!activeDate) return {};
        return (
            activeDate.courses.find(({ startCourse, endCourse }) =>
                isInInterval(currentTime.time, startCourse.time, endCourse.time)
            ) ?? {}
        );
    }, [activeDate, currentTime.time]);

    const progression = useMemo(() => {
        if (objectsEqual(activeCourse, {})) return 0;
        const [activeMinutes, startMinutes, endMinutes] =
            convertTimeHoursMinToMinutes(
                currentTime.time,
                activeCourse.startCourse.time,
                activeCourse.endCourse.time
            );
        return parseFloat(
            ((activeMinutes - startMinutes) / (endMinutes - startMinutes)).toFixed(4)
        );
    }, [activeCourse, currentTime.time]);

    function buildNextCourseResult(course, nextDate, isLastCourseOfTheDay) {
        return {
            nextCourse: {
                course,
                timeRemaining: getTimeInterval(
                    `${currentTime.date}T${currentTime.time}`,
                    `${course.startCourse.date}T${course.startCourse.time}`
                ),
            },
            nextDate,
            isLastCourseOfTheDay,
        };
    }

    const { nextCourse, nextDate, isLastCourseOfTheDay } = useMemo(() => {
        const EMPTY_RESULT = {
            nextCourse: {},
            nextDate: null,
            isLastCourseOfTheDay: null,
        };

        if (!activeDate) {
            return EMPTY_RESULT;
        }

        const courses = activeDate.courses;
        const firstCourse = courses[0];
        const lastCourse = courses[courses.length - 1];

        const activeCourseIndex = !objectsEqual(activeCourse, {})
            ? courses.findIndex((c) => objectsEqual(c, activeCourse))
            : -1;

        const isLastCourseOfTheDay = activeCourseIndex === courses.length - 1;

        const isBeforeSchoolDay = isBefore(
            currentTime.time,
            firstCourse.startCourse.time
        );
        const isDuringCourseHours = isInInterval(
            currentTime.time,
            firstCourse.startCourse.time,
            lastCourse.endCourse.time
        );
        const isAfterSchoolDay = !isBeforeSchoolDay && !isDuringCourseHours;
        const isOnBreakBetweenCourses =
            isDuringCourseHours && activeCourseIndex === -1;
        const isInsideACourse = activeCourseIndex !== -1;
        // before the start of th day, next course is the first
        if (isBeforeSchoolDay) {
            return buildNextCourseResult(
                firstCourse,
                activeDate,
                isLastCourseOfTheDay
            );
        }
        // break between 2 courses, find the next that's about to start
        if (isOnBreakBetweenCourses) {
            const nextCourseIndex = courses.findIndex(({ startCourse }) =>
                isAfter(startCourse.time, currentTime.time)
            );

            if (nextCourseIndex === -1) {
                console.error("Big error: no next course found during course hours");
                return { ...EMPTY_RESULT, isLastCourseOfTheDay };
            }

            return buildNextCourseResult(
                courses[nextCourseIndex],
                activeDate,
                isLastCourseOfTheDay
            );
        }

        // normal case
        if (isInsideACourse && !isLastCourseOfTheDay) {
            return buildNextCourseResult(
                courses[activeCourseIndex + 1],
                activeDate,
                isLastCourseOfTheDay
            );
        }

        // day ended or last course, next course is the first of the next day
        if (isLastCourseOfTheDay || isAfterSchoolDay) {
            const activeDateIndex = timetableData.findIndex((d) =>
                objectsEqual(d, activeDate)
            );
            const followingDate = timetableData[activeDateIndex + 1];

            if (!followingDate) {
                return { nextCourse: {}, nextDate: null, isLastCourseOfTheDay };
            }

            return buildNextCourseResult(
                followingDate.courses[0],
                followingDate,
                isLastCourseOfTheDay
            );
        }

        // bruh
        console.error("Big error: unhandled next-course state");
        return EMPTY_RESULT;
    }, [activeDate, activeCourse, timetableData, currentTime]);

    const activeStatus = useMemo(() => {
        return {
            inClass: !objectsEqual(activeCourse, {}),
            nextCourseKnown: !objectsEqual(nextCourse, {}),
        };
    }, [activeCourse, nextCourse]);
    return (
        <ScreenStack>
            <SharePopup visible={showPopup} onClose={handleClosePopup} />
            <View style={{ paddingHorizontal: 20 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    overScrollMode="never"
                >
                    <SafeAreaView
                        style={{
                            marginTop: 10,
                        }}
                    >
                        <Pressable
                            style={{
                                overflow: "hidden",
                                borderRadius: 16,
                                marginBottom: 18,
                                opacity: 0.85,
                                borderColor: "hsla(0, 0%, 100%, 0.6)",
                                borderWidth: 1.5,
                                width: 46,
                                height: 46,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "hsla(0, 0%, 100%, 0.3)",
                            }}
                            onPress={() =>
                                navigation.navigate(
                                    routesNames.navigators.settings,
                                    {
                                        screen: routesNames.settings.home,
                                    }
                                )
                            }
                        >
                            {localPhotoUri == undefined ? (
                                <Text
                                    preset="h4"
                                    size={26}
                                    style={{ fontFamily: "Petrona-SemiBold" }}
                                >
                                    {name[0]}
                                </Text>
                            ) : (
                                <Image
                                    source={getProfileImageSource()}
                                    style={{
                                        width: 46,
                                        height: 46,
                                        transform: [{ scale: 1.2 }],
                                    }}
                                />
                            )}
                        </Pressable>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text
                                    size={26}
                                    color={withAlpha(colors.text.primary, 0.4)}
                                    style={{ fontFamily: "Medium", lineHeight: 25 }}
                                >
                                    {greetingMessage}
                                </Text>
                                <Text
                                    size={38}
                                    style={{
                                        fontFamily: "Petrona-SemiBold",
                                        letterSpacing: 0.3,
                                    }}
                                >
                                    {name} 👋
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                    <View style={{ gap: 26 }}>
                        <ActiveCourseCard
                            progression={progression}
                            activeCourse={activeCourse}
                            nextCourse={nextCourse}
                            activeStatus={activeStatus}
                            isLast={isLastCourseOfTheDay}
                        />
                        <View style={{ gap: 3 }}>
                            <GeneralAveragePreview gradesData={gradesData} />
                            {gradesData?.lastGrades?.length >= 1 && (
                                <LastGrades
                                    lastGradesObject={gradesData.lastGrades}
                                />
                            )}
                        </View>
                        <HomeworksPreview
                            customHomeworks={customDataStore?.customHomeworks ?? {}}
                            homeworksDatas={homeworksData}
                        />
                    </View>
                    {token === "guest_token" && <GuestTestButtons />}
                    <View style={{ height: 25 }} />
                </ScrollView>
            </View>
        </ScreenStack>
    );
}
