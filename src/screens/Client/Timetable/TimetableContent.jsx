import { useFocusEffect, useNavigation, useTheme } from "@react-navigation/native";
import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import VerticalScrollView from "@/components/layout/VerticalScrollView";
import { RoadFinish } from "@/components/svg";
import { CONFIG } from "@/constants/config";
import { GLOBALS_DATAS } from "@/constants/device/globals";
import { timetableConfig } from "@/constants/features/timetableConfig";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import { Text } from "@/components/core";
import { routesNames } from "@/router/config/routesNames";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";

import { useTimetable } from "@/features/timetable";
import { useUserStore } from "@/hooks/useUserStore";

let {
    screen: { height, width },
} = GLOBALS_DATAS;

height -= CONFIG.upper + 24; // ??? but works fine

const screenHeight = height;

const hasCourses = (day) => Array.isArray(day?.courses) && day.courses.length > 0;

export const getTargetTimetableIndex = (timetableData) => {
    if (!Array.isArray(timetableData) || timetableData.length === 0) return -1;

    const targetIndex = timetableData.findIndex(
        (day) => day.date >= CONFIG.dateNow && hasCourses(day)
    );

    if (targetIndex !== -1) {
        return targetIndex;
    }

    for (let i = timetableData.length - 1; i >= 0; i--) {
        if (hasCourses(timetableData[i])) {
            return i;
        }
    }

    return 0;
};

export default function TimetableContent() {
    const navigation = useNavigation();
    const theme = useTheme();

    const scrollViewRef = useRef(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const token = useUserStore((state) => state.token);
    const {
        data: timetableData,
        isLoading,
        isError,
        extendForward,
        extendBackward,
        resetRange,
    } = useTimetable(token);
    const [timetableViewDims, setTimetableViewDims] = useState({
        width: 0,
        height: 0,
    });
    const [timetableCoreSuccessLoaded, setTimetableCoreSuccessLoaded] =
        useState(false);

    const currentDateRef = useRef(null);
    const prevFirstDateRef = useRef(null);

    const dynamicOpacity = useSharedValue(0);
    const dynamicOpacityStyle = useAnimatedStyle(() => ({
        opacity: dynamicOpacity.value,
    }));

    const activeDate = timetableData?.[currentIndex]?.iSODate || "";

    useFocusEffect(
        useCallback(() => {
            return () => {
                currentDateRef.current = null;
                prevFirstDateRef.current = null;
                resetRange();
            };
        }, [resetRange])
    );

    useEffect(() => {
        if (timetableData?.[currentIndex]) {
            currentDateRef.current = timetableData[currentIndex].date;
        }
    }, [currentIndex, timetableData]);

    const handleIndexChange = useCallback(
        (index) => {
            setCurrentIndex(index);

            if (timetableData && index >= timetableData.length - 4) {
                extendForward();
            }

            if (index <= 4) {
                extendBackward();
            }
        },
        [timetableData?.length, extendForward, extendBackward]
    );

    useLayoutEffect(() => {
        if (
            !timetableCoreSuccessLoaded ||
            !Array.isArray(timetableData) ||
            !timetableData.length
        )
            return;

        if (!currentDateRef.current || !prevFirstDateRef.current) {
            const targetIndex = getTargetTimetableIndex(timetableData);

            if (targetIndex !== -1) {
                scrollViewRef.current?.scrollToIndex(targetIndex, false);
                setCurrentIndex(targetIndex);
                currentDateRef.current = timetableData[targetIndex]?.date;
            }

            prevFirstDateRef.current = timetableData[0]?.date;
            dynamicOpacity.value = withSpring(1, { duration: 1500 });
            return;
        }

        const oldFirstDate = prevFirstDateRef.current;
        const newFirstDate = timetableData[0]?.date;

        if (oldFirstDate && oldFirstDate !== newFirstDate) {
            const addedAtStart = timetableData.findIndex(
                (d) => d.date === oldFirstDate
            );

            if (addedAtStart > 0) {
                scrollViewRef.current?.adjustForPrepend(addedAtStart);
                setCurrentIndex((prev) => prev + addedAtStart);
            }
        }

        prevFirstDateRef.current = newFirstDate;
    }, [timetableCoreSuccessLoaded, timetableData]);

    return (
        <View
            style={{
                flex: 1,
                top: 20,
            }}
            onLayout={() => setTimetableCoreSuccessLoaded(true)}
        >
            <Animated.View
                style={[
                    dynamicOpacityStyle,
                    {
                        margin: 0,
                        overflow: "hidden",
                        flex: 1,
                        height: screenHeight,
                    },
                ]}
            >
                <View
                    style={{
                        alignItems: "center",
                        width: "100%",
                        height: "8%",
                        zIndex: 100,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            backgroundColor: theme.colors.main,
                            width: "80%", // Otherwise "Dimanche 16 Novembre" won't fit
                            position: "absolute",
                            height: "65%",
                            borderRadius: 50,
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            bottom: 0,
                        }}
                        onLongPress={() => {
                            if (!Array.isArray(timetableData)) return;
                            const targetIndex =
                                getTargetTimetableIndex(timetableData);
                            if (targetIndex !== -1) {
                                scrollViewRef.current?.scrollToIndex(targetIndex);
                            }
                        }}
                    >
                        <Text preset="title1" oneLine color={theme.colors.theme}>
                            {activeDate}
                        </Text>
                    </TouchableOpacity>
                </View>

                <VerticalScrollView
                    arrayLength={timetableData?.length}
                    getIndex={handleIndexChange}
                    ref={scrollViewRef}
                >
                    {timetableData?.map((currentDay, index) => {
                        const isVisible = Math.abs(index - currentIndex) <= 2;
                        return (
                            <DayShedule
                                key={currentDay.date || index}
                                currentDay={currentDay}
                                navigation={navigation}
                                theme={theme}
                                timetableViewDims={{
                                    getter: timetableViewDims,
                                    setter: setTimetableViewDims,
                                }}
                                index={index}
                                isVisible={isVisible}
                            />
                        );
                    })}
                </VerticalScrollView>
            </Animated.View>
        </View>
    );
}

const CourseBox = memo(({ course, navigation, theme, timetableViewDims }) => {
    const [roomLayout, setRoomLayout] = useState(null);
    const [overlap, setOverlap] = useState(false);
    const libelleLayoutRef = useRef(false);

    const roomLayoutRef = useRef(false);

    const [startCourseLayout, setStartCourseLayout] = useState(null);
    const startCourseLayoutRef = useRef(false);

    const { colors } = useTheme();
    const caseColor = addOpacityToCssRgb(colors.theme, 0.2);

    useEffect(() => {
        if (roomLayout && startCourseLayout) {
            const TOLERANCE = 2;

            const checkX1 =
                roomLayout.x <
                startCourseLayout.x + startCourseLayout.width + TOLERANCE;
            const checkX2 =
                roomLayout.x + roomLayout.width > startCourseLayout.x - TOLERANCE;
            const checkY1 =
                roomLayout.y <
                startCourseLayout.y + startCourseLayout.height + TOLERANCE;
            const checkY2 =
                roomLayout.y + roomLayout.height > startCourseLayout.y - TOLERANCE;
            const isOverlapping = checkX1 && checkX2 && checkY1 && checkY2;

            setOverlap(isOverlapping);
        }
    }, [roomLayout, startCourseLayout]);
    const {
        // classGroup,
        endCourse,
        // group,
        isCancelled,
        isDispensed,
        // isEdited,
        libelle,
        room,
        startCourse,
        teacher,
        webId,
        color,
        placing,
        height,
        textColor,
    } = course;

    const handleLibelleLayout = (e) => {
        if (!libelleLayoutRef.current) {
            libelleLayoutRef.current = true;
        }
    };

    const handleRoomLayout = (e) => {
        if (!roomLayoutRef.current) {
            setRoomLayout(e.nativeEvent.layout);
            roomLayoutRef.current = true;
        }
    };
    const handleStartCourseLayout = (e) => {
        if (!startCourseLayoutRef.current) {
            setStartCourseLayout(e.nativeEvent.layout);
            startCourseLayoutRef.current = true;
        }
    };

    const { shadow } = useTheme();
    const shadowColor = addOpacityToCssRgb("rgb(0, 0, 0)", shadow.oppacity);

    return (
        <Animated.View
            key={webId}
            style={[
                {
                    height: `${height - 0.15}%`,
                    top: `${placing}%`,
                    width: "100%",
                    position: "absolute",
                    borderRadius: 16,
                },
            ]}
        >
            <TouchableOpacity
                style={[
                    {
                        marginHorizontal: 24,
                        paddingHorizontal: 12,
                        flex: 1,
                        paddingVertical:
                            height <= CONFIG.minCourseSize
                                ? timetableViewDims.height /
                                      CONFIG.minCourseSize /
                                      height +
                                  1
                                : CONFIG.minCourseSize,
                        overflow: "hidden",
                        backgroundColor: colors.secondary,
                        borderRadius: 16,
                        borderColor: color,
                        borderWidth: 1.5,
                        boxShadow: `1px 2px 5px 0px ${shadowColor}`,
                    },
                ]}
                activeOpacity={0.5}
                onPress={() => {
                    navigation.navigate(
                        routesNames.client.timetable.course_details,
                        {
                            courseData: course,
                        }
                    );
                }}
            >
                {(isCancelled || isDispensed) && (
                    <View
                        style={{
                            position: "absolute",
                            zIndex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0,

                            backgroundColor: isCancelled
                                ? addOpacityToCssRgb(
                                      timetableConfig.cancelledColor,
                                      0.43
                                  )
                                : addOpacityToCssRgb(
                                      timetableConfig.dispensedColor,
                                      0.43
                                  ),
                        }}
                    >
                        <Text
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 2,
                                backgroundColor: isCancelled
                                    ? timetableConfig.cancelledColor
                                    : timetableConfig.dispensedColor,
                                borderRadius: 50,

                                borderColor: theme.colors.contrast,
                                borderWidth: 1.2,
                                elevation: 14,
                                transform: [{ rotate: "-6deg" }],
                            }}
                            preset="title1"
                        >
                            {isCancelled ? "Annulé" : "Dispensé"}
                        </Text>
                    </View>
                )}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        flex: 1,
                        opacity: 1,
                        width: "100%",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                gap: 6,
                                alignItems: "center",
                                width: "100%",
                            }}
                        >
                            <Text
                                style={{
                                    color: color,
                                    fontSize: 18,
                                    fontFamily: "Bold",
                                }}

                                onLayout={handleLibelleLayout}
                            >
                                {libelle}
                            </Text>

                            <Text
                                preset="label3"
                                color={color}
                                onLayout={handleRoomLayout}
                                style={{
                                    fontSize: overlap ? 10 : 12,
                                    fontWeight: "bold",
                                }}
                            >
                                {room}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: "Medium",
                                    fontSize: 14,
                                    paddingVertical: -2,
                                    flexShrink: 0,
                                    position: "absolute",
                                    bottom: -5,
                                }}
                            >
                                {teacher}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            right: 40,
                            position: "absolute",
                            height: "100%",
                        }}
                    >
                        <RoadFinish size={14} />
                    </View>
                    <View
                        onLayout={handleStartCourseLayout}
                        style={{
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            height: "100%",
                            right: 0,
                            position: "absolute",
                        }}
                    >
                        <Text preset="label2">{startCourse.time}</Text>
                        <View
                            style={{
                                width: 3,
                                backgroundColor: color,
                                flexDirection: "row",
                                flex: 1,
                                borderRadius: 30,
                            }}
                        />
                        <Text preset="label2">{endCourse.time}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

const DayShedule = memo(
    ({
        currentDay,
        navigation,
        theme,
        timetableViewDims = { getter, setter },
        index,
        isVisible = true,
    }) => {
        if (!isVisible) {
            return (
                <View
                    style={{
                        width: "100%",
                        height: screenHeight - 95, // idk why but... works on other devices ?
                        top: 25,
                        position: "absolute",
                        zIndex: 10,
                    }}
                />
            );
        }

        return (
            <View
                style={{
                    width: "100%",
                    height: screenHeight - 95, // idk why but... works on other devices ?
                    top: 25,

                    alignItems: "center",
                    position: "absolute",
                    zIndex: 10,
                }}
                onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    timetableViewDims.setter({ width, height });
                }}
            >
                {currentDay?.courses.map((course, courseIndex) => (
                    <CourseBox
                        key={course.webId}
                        course={course}
                        navigation={navigation}
                        theme={theme}
                        timetableViewDims={timetableViewDims.getter}
                        courseIndex={courseIndex}
                    />
                ))}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    loader: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(10, 10, 10)",
    },
});

