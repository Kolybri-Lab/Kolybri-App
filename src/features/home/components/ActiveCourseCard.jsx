import { Text } from "@/components";
import { ProgressBar } from "@/components/progression/ProgressBar";
import { BackArrow } from "@/components/svg";
import { useHaptic } from "@/hooks/useHaptics";
import { routesNames } from "@/router/config/routesNames";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import { useNavigation, useTheme } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";

export default function ActiveCourseCard({
    progression,
    activeCourse,
    nextCourse,
    activeStatus,
    isLast,
}) {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const haptic = useHaptic("medium");

    const { inClass, nextCourseKnown } = activeStatus || {};

    const message = nextCourseKnown ? "EN COURS" : "DERNIER COURS CONNU";
    const color = nextCourseKnown ? colors.main : "hsla(295, 64%, 71%, 1)";
    const extras = inClass ? [] : [{ resizeBars: true }];

    return (
        <View style={{ width: "100%" }}>
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
                                backgroundColor: addOpacityToCssRgb(
                                    colors.main,
                                    0.9
                                ),
                                width: 6,
                                height: 6,
                                borderRadius: 5,
                            }}
                        />
                        <Text
                            color={addOpacityToCssRgb(colors.main, 0.9)}
                            style={{ fontFamily: "SemiBold", fontSize: 16 }}
                        >
                            {isLast ? "DERNIER COURS DE LA JOURNÉE !" : message}
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
                            data={{
                                courseData: activeCourse,
                                color,
                                message,
                                progression,
                                isLast,
                            }}
                        />
                    </TouchableOpacity>
                </View>
            )}
            {nextCourseKnown && (
                <View>
                    {!inClass && (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginLeft: 6,
                            }}
                        >
                            <Text
                                color={addOpacityToCssRgb(colors.main, 0.9)}
                                style={{ fontFamily: "SemiBold", fontSize: 16 }}
                            >
                                PROCHAIN COURS
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => {
                            haptic();
                            navigation.navigate(routesNames.client.timetable.group, {
                                screen: routesNames.client.timetable.content,
                            });
                        }}
                        style={{ width: "100%" }}
                    >
                        <NextCourse
                            data={{
                                courseData: nextCourse,
                                extras,
                                inClass,
                            }}
                        />
                    </TouchableOpacity>
                </View>
            )}
            {!inClass && !nextCourseKnown && <AnyCourse />}
        </View>
    );
}

const Course = ({ data }) => {
    const { colors } = useTheme();
    const { courseData, color, message, progression, isLast } = data;
    return (
        <View
            style={{
                gap: 3,
                width: "100%",
                height: 70,
                flexDirection: "row",
                flex: 1,
            }}
        >
            <View
                style={{
                    padding: 10,
                    alignItems: "center",
                    width: 65,
                    backgroundColor: colors.secondary,
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 4,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                }}
            >
                <Text style={{ flexShrink: 0, fontFamily: "Medium", fontSize: 14 }}>
                    {courseData.startCourse.time}
                </Text>
                <View
                    style={{
                        flex: 1,
                        width: 2,
                        borderRadius: 2,
                        backgroundColor: colors.contrast,
                        marginVertical: -2,
                    }}
                />
                <Text style={{ flexShrink: 0, fontFamily: "Medium", fontSize: 14 }}>
                    {courseData.endCourse.time}
                </Text>
            </View>
            <View
                style={{
                    backgroundColor: colors.secondary,
                    flex: 1,
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 16,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                }}
            >
                <View
                    style={{
                        justifyContent: "space-between",
                        flexDirection: "row",
                        marginBottom: 2,
                    }}
                >
                    <Text
                        color={addOpacityToCssRgb(colors.contrast, 0.9)}
                        oneLine
                        style={{ flexShrink: 1, fontFamily: "Bold", fontSize: 18 }}
                    >
                        {courseData?.libelle}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <BackArrow
                            props={{ transform: [{ rotate: "180deg" }] }}
                            fill={addOpacityToCssRgb(colors.contrast, 0.9)}
                            size={22}
                        />
                        <Text
                            style={{
                                flexShrink: 1,
                                color: addOpacityToCssRgb(colors.contrast, 0.9),
                                fontFamily: "SemiBold",
                                fontSize: 16,
                            }}
                        >
                            {courseData?.endCourse?.time}
                        </Text>
                    </View>
                </View>
                <View style={{ justifyContent: "space-between", marginBottom: 7 }}>
                    <ProgressBar
                        progression={progression}
                        color={addOpacityToCssRgb(colors.main, 0.85)}
                        style={{
                            backgroundColor: addOpacityToCssRgb(colors.main, 0.25),
                            height: 10,
                        }}
                    />
                </View>
            </View>
        </View>
    );
};
const NextCourse = ({ data }) => {
    const { courseData, extras, inClass } = data;
    const { colors } = useTheme();
    const resizeBars = !Boolean(extras.find((e) => e?.resizeBars)?.resizeBars);
    return (
        <View
            style={{
                gap: 3,
                width: "100%",
                height: 70,
                flexDirection: "row",
                flex: 1,
            }}
        >
            <View
                style={{
                    paddingVertical: 10,
                    alignItems: "center",
                    width: 65,
                    backgroundColor: colors.secondary,
                    borderTopLeftRadius: inClass ? 0 : 16,
                    borderTopRightRadius: inClass ? 0 : 4,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 4,
                }}
            >
                <Text style={{ flexShrink: 0, fontFamily: "Medium", fontSize: 14 }}>
                    {courseData.course.startCourse.time}
                </Text>
                <View
                    style={{
                        flex: 1,
                        width: 2,
                        borderRadius: 2,
                        backgroundColor: colors.contrast,
                        marginVertical: -2,
                    }}
                />
                <Text style={{ flexShrink: 0, fontFamily: "Medium", fontSize: 14 }}>
                    {courseData.course.endCourse.time}
                </Text>
            </View>
            <View
                style={{
                    padding: 10,
                    paddingLeft: 16,
                    paddingRight: 14,
                    flex: 1,
                    backgroundColor: colors.secondary,
                    borderTopLeftRadius: inClass ? 0 : 4,
                    borderTopRightRadius: inClass ? 0 : 16,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 16,
                    justifyContent: "space-between",
                    flexDirection: "row",
                }}
            >
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text
                        oneLine
                        style={{ fontSize: 18, fontFamily: "Bold" }}
                        color="hsla(1, 0%, 100%, .9)"
                    >
                        {courseData.course.libelle}
                    </Text>
                    <View
                        style={{
                            flexShrink: 0,
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text
                            color="hsla(1, 0%, 100%, .9)"
                            oneLine
                            style={{
                                fontSize: 15,
                                opacity: 0.6,
                                fontFamily: "Medium",
                                lineHeight: 15,
                            }}
                        >
                            {courseData.course.teacher ?? "Pas de prof."}
                        </Text>
                        <Text
                            color="hsla(1, 0%, 100%, .9)"
                            oneLine
                            style={{
                                fontSize: 15,
                                opacity: 0.6,
                                fontFamily: "Medium",
                                lineHeight: 15,
                            }}
                        >
                            {courseData.course.room ?? "Aucune salle"}
                        </Text>
                    </View>
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
                backgroundColor: colors.secondary,
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
                    backgroundColor: addOpacityToCssRgb(colors.main, 0.15),
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Text style={{ fontSize: 24 }}>🎉</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontFamily: "Bold",
                        fontSize: 17,
                        marginBottom: 2,
                    }}
                >
                    Aucun cours pour le moment
                </Text>
                <Text
                    color={addOpacityToCssRgb(colors.contrast, 0.6)}
                    style={{ fontFamily: "Medium", fontSize: 14 }}
                >
                    Profites-en pour souffler un peu 😌
                </Text>
            </View>
        </View>
    );
};

