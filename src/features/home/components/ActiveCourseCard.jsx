import { Text } from "@/components";
import { ProgressBar } from "@/components/progression/ProgressBar";
import { BackArrow } from "@/components/svg";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { routesNames } from "@/router/config/routesNames";
import { withAlpha } from "@/themes/color";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import { useNavigation } from "@react-navigation/native";
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
    const color = nextCourseKnown ? colors.brand.primary : "hsla(295, 64%, 71%, 1)";
    const extras = inClass ? [] : [{ resizeBars: true }];

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
                                backgroundColor: colors.brand.highlight,
                                width: 6,
                                height: 6,
                                borderRadius: 5,
                            }}
                        />
                        <Text
                            color={colors.text.accent}
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
                                color={addOpacityToCssRgb(colors.text.brand, 0.9)}
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
    const textColor = addOpacityToCssRgb(colors.text.primary, 0.9);

    return (
        // Une seule carte : fond + arrondis sur le conteneur
        <View
            style={{
                width: "100%",
                height: 70,
                flex: 1,
                flexDirection: "row",
                backgroundColor: colors.surface.raised,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                // collée à la carte suivante, sauf s'il n'y en a pas
                borderBottomLeftRadius: isLast ? 4 : 16,
                borderBottomRightRadius: isLast ? 4 : 16,
            }}
        >
            {/* Horaires : centrés verticalement, séparateur court */}
            <View
                style={{
                    width: 64,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    color={colors.text.secondary}
                    style={{ fontFamily: "Medium", fontSize: 14, lineHeight: 18 }}
                >
                    {courseData.startCourse.time}
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
                    color={colors.text.secondary}
                    style={{ fontFamily: "Medium", fontSize: 14, lineHeight: 18 }}
                >
                    {courseData.endCourse.time}
                </Text>
            </View>

            {/* Contenu : titre + heure de fin, puis la barre */}
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
                        oneLine
                        color={textColor}
                        style={{
                            flexShrink: 1,
                            fontFamily: "Bold",
                            fontSize: 18,
                            lineHeight: 24,
                        }}
                    >
                        {courseData?.libelle}
                    </Text>

                    {/* flexShrink 0 : c'est le titre qui se tronque, pas l'heure */}
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
                            color={colors.text.secondary}
                            style={{
                                fontFamily: "Medium",
                                fontSize: 16,
                                lineHeight: 20,
                            }}
                        >
                            {courseData?.endCourse?.time}
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
const NextCourse = ({ data }) => {
    const { courseData, extras, inClass } = data;
    const { colors, components } = useTheme();
    const resizeBars = !Boolean(extras.find((e) => e?.resizeBars)?.resizeBars);

    return (
        // Une seule carte : fond + arrondis sur le conteneur
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
            {/* Horaires : centrés verticalement, séparateur court */}
            <View
                style={{
                    width: 64,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    color={withAlpha(colors.text.secondary, 0.7)}
                    style={{ fontFamily: "Medium", fontSize: 14, lineHeight: 18 }}
                >
                    {courseData.course.startCourse.time}
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
                    color={withAlpha(colors.text.secondary, 0.7)}
                    style={{ fontFamily: "Medium", fontSize: 14, lineHeight: 18 }}
                >
                    {courseData.course.endCourse.time}
                </Text>
            </View>

            {/* Contenu : titre en haut, prof / salle en bas */}
            <View
                style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingLeft: 24,
                    paddingRight: 16,
                    justifyContent: "space-between",
                }}
            >
                <Text
                    oneLine
                    color={colors.text.primary}
                    style={{ fontSize: 18, fontFamily: "Bold" }}
                >
                    {courseData.course.libelle}
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
                        oneLine
                        color={withAlpha(colors.text.secondary, 0.7)}
                        style={{
                            flexShrink: 1,
                            fontSize: 15,
                            fontFamily: "Medium",
                            lineHeight: 15,
                        }}
                    >
                        {courseData.course.teacher ?? "Pas de prof."}
                    </Text>
                    <Text
                        oneLine
                        color={withAlpha(colors.text.secondary, 0.7)}
                        style={{
                            flexShrink: 0,
                            fontSize: 15,
                            fontFamily: "Medium",
                            lineHeight: 15,
                        }}
                    >
                        {courseData.course.room ?? "Aucune salle"}
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
                    color={addOpacityToCssRgb(colors.text.primary, 0.6)}
                    style={{ fontFamily: "Medium", fontSize: 14 }}
                >
                    Profites-en pour souffler un peu 😌
                </Text>
            </View>
        </View>
    );
};

