import { useTheme } from "@/hooks/useThemeStore";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";

import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components/core";
import {
    BellOff,
    Clock,
    DoorOpen,
    Hourglass,
    PenSquare,
    Peoples,
    Person,
    Trash,
} from "@/components/svg";
import { routesNames } from "@/router/config/routesNames";
import { toHoursMinutes, toMilliseconds } from "@/utils/time";
import { GoBackHeader, SwipeBackWrapper } from "../../../components";

export default function CourseDetails({ route }) {
    const { courseData = {} } = route?.params || {};
    const { colors } = useTheme();

    const [now, setNow] = useState(dayjs());
    const [startCourseTiming, setStartCourseTiming] = useState("");

    const {
        classGroup,
        endCourse,
        group,
        isCancelled,
        isDispensed,
        isEdited,
        libelle,
        room,
        startCourse,
        teacher,
        webId,
        color,
        placing,
        height,
        textColor,
    } = courseData;

    const courseTiming =
        toMilliseconds(endCourse.time) - toMilliseconds(startCourse.time);
    const [hours, minutes] = toHoursMinutes(courseTiming);
    const startCourseDateTime = dayjs(`${startCourse.date} ${startCourse.time}`);

    const [intervalDays, intervalHours, intervalMinutes] = [
        startCourseDateTime.diff(now, "days"),
        startCourseDateTime.diff(now, "hours") % 24,
        startCourseDateTime.diff(now, "minutes") % 60,
    ];

    useFocusEffect(
        useCallback(() => {
            // Focus

            return () => {
                // Blur -> closed
            };
        }, [])
    );
    const Separation = useCallback(
        () => (
            <View
                style={{
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        width: "85%",
                        height: 2,
                        backgroundColor: colors.bg.bg4,
                    }}
                />
            </View>
        ),

        []
    );

    const startCourseTimingCat = {
        jour: intervalDays,
        heure: intervalHours,
        minute: intervalMinutes,
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(dayjs());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let timingMessage = "";

        if (intervalDays <= 0 && intervalHours <= 0 && intervalMinutes <= 0) {
            timingMessage += "Il y a ";

            Object.entries(startCourseTimingCat).forEach(([timingName, value]) => {
                if (value < 0) {
                    value = Math.abs(value);
                    timingMessage += `${value} ${timingName}${value > 1 ? "s" : ""} `;
                }
            });
        } else {
            timingMessage += "Dans ";

            Object.entries(startCourseTimingCat).forEach(([timingName, value]) => {
                if (value > 0) {
                    timingMessage += `${value} ${timingName}${value > 1 ? "s" : ""} `;
                }
            });
        }

        setStartCourseTiming(timingMessage.trim());
    }, [now.format("HH:mm")]);

    let timing = "";

    if (hours > 0) {
        timing += `${hours} heure${hours > 1 ? "s" : ""}`;
    } else if (minutes > 0) {
        timing += `${minutes} minute${minutes > 1 ? "s" : 0}`;
    } else {
        timing = "Erreur lors de la lecture du temps";
    }
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ paddingHorizontal: 15 }}>
                <GoBackHeader fallbackRoute={routesNames.client.timetable.content} />
            </View>
            <SwipeBackWrapper>
                <View
                    style={{
                        justifyContent: "space-evenly",
                        flex: 1,
                        marginVertical: "3%",
                    }}
                >
                    <View
                        style={{
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: color,
                                borderRadius: 6,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                            }}
                        >
                            <Text preset="h2" color={textColor} align="center">
                                {libelle}
                            </Text>
                        </View>
                        <View
                            style={{
                                marginTop: "10%",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            {startCourseTiming && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Clock />
                                    <Text
                                        style={{
                                            marginLeft: 15,
                                        }}
                                        preset="title1"
                                    >{`${startCourseTiming}`}</Text>
                                </View>
                            )}
                            {isCancelled && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Trash />
                                    <Text
                                        style={{
                                            marginLeft: 15,
                                        }}
                                        preset="h3"
                                    >{`Annulé`}</Text>
                                </View>
                            )}
                            {isEdited && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <PenSquare />
                                    <Text
                                        style={{
                                            marginLeft: 15,
                                        }}
                                        preset="h3"
                                    >{`Modifié`}</Text>
                                </View>
                            )}
                            {isDispensed && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <BellOff />
                                    <Text
                                        style={{
                                            marginLeft: 15,
                                        }}
                                        preset="h3"
                                    >{`Dispensé`}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <View>
                        {timing && (
                            <>
                                <Separation />
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginLeft: "12.5%",
                                        marginVertical: "7%",
                                    }}
                                >
                                    <Hourglass />
                                    <Text
                                        style={{
                                            marginLeft: 30,
                                        }}
                                        preset="label1"
                                    >{`${timing}`}</Text>
                                </View>
                            </>
                        )}

                        <Separation />
                        <View
                            style={{
                                flexDirection: "column",
                                marginLeft: "12.5%",
                                marginVertical: "7%",
                                gap: 10,
                            }}
                        >
                            {teacher && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Person />
                                    <Text
                                        style={{
                                            marginLeft: 30,
                                        }}
                                        preset="label1"
                                        oneLine
                                    >{`${teacher}`}</Text>
                                </View>
                            )}
                            {room && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <DoorOpen />
                                    <Text
                                        style={{
                                            marginLeft: 30,
                                        }}
                                        preset="label1"
                                    >{`${room}`}</Text>
                                </View>
                            )}
                            {group && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Peoples />
                                    <Text
                                        style={{
                                            marginLeft: 30,
                                        }}
                                        preset="label1"
                                    >{`${group}`}</Text>
                                </View>
                            )}
                        </View>
                        {(teacher || room || group) && <Separation />}
                    </View>
                    {/* <View
                    style={{
                        marginTop: 15,
                        flexDirection: "row",
                        gap: "10%",
                        justifyContent: "center",
                    }}
                >
                    <Pressable
                        style={{
                            backgroundColor: colors.bg.bg6,
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 50,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                textAlign: "center",
                                fontWeight: 450,
                            }}
                        >
                            Contenu
                        </Text>
                    </Pressable>
                    <Pressable
                        style={{
                            backgroundColor: colors.bg.bg6,
                            paddingHorizontal: 21,
                            paddingVertical: 12,
                            borderRadius: 50,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 450,
                            }}
                        >
                            Devoirs
                        </Text>
                    </Pressable>
                </View> */}
                </View>
            </SwipeBackWrapper>
        </View>
    );
}

