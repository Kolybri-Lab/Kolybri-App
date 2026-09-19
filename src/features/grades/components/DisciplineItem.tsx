import { Text as CoreText } from "@/components/core";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useTheme } from "@/hooks/useThemeStore";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Discipline from "../models/Discipline";
import Grade from "../models/Grade";
import GradeItem from "./GradeItem";
import SimpleFlamme from "./SimpleFlamme";
import SimulatedGradeItem from "./SimulatedGradeItem";
const Text = CoreText as any;

interface DisciplineItemProps {
    discipline: Discipline;
    index?: number;
    dataLength?: number;
    isFirst?: boolean;
    isLast?: boolean;
    isExpanded: boolean;
    onPress: () => void;
    dispatch: (action: any) => void;
}

export default function DisciplineItem({
    discipline,
    index = 0,
    dataLength = 1,
    isFirst = index === 0,
    isLast = index === dataLength - 1,
    isExpanded,
    onPress,
    dispatch,
}: DisciplineItemProps) {
    const { colors } = useTheme() as any;
    const [shouldRenderContent, setShouldRenderContent] = useState(isExpanded);
    const expandProgress = useSharedValue(isExpanded ? 1 : 0);

    useEffect(() => {
        if (isExpanded) {
            setShouldRenderContent(true);
        }
        expandProgress.value = withTiming(
            isExpanded ? 1 : 0,
            { duration: 300 },
            (finished) => {
                if (finished && !isExpanded) {
                    runOnJS(setShouldRenderContent)(false);
                }
            }
        );
    }, [isExpanded]);

    const topRadiusClosed = isFirst ? 20 : 12;
    const bottomRadiusClosed = isLast ? 20 : 12;

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(
            expandProgress.value,
            [0, 0.5, 1],
            [topRadiusClosed, 11, 16],
            Extrapolation.CLAMP
        ),
        borderTopRightRadius: interpolate(
            expandProgress.value,
            [0, 0.5, 1],
            [topRadiusClosed, 11, 16],
            Extrapolation.CLAMP
        ),
        borderBottomLeftRadius: interpolate(
            expandProgress.value,
            [0, 0.5, 1],
            [bottomRadiusClosed, 11, 16],
            Extrapolation.CLAMP
        ),
        borderBottomRightRadius: interpolate(
            expandProgress.value,
            [0, 0.5, 1],
            [bottomRadiusClosed, 11, 16],
            Extrapolation.CLAMP
        ),
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        maxHeight: interpolate(
            expandProgress.value,
            [0, 1],
            [0, 800],
            Extrapolation.CLAMP
        ),
        opacity: interpolate(
            expandProgress.value,
            [0, 0.3, 1],
            [0, 0, 1],
            Extrapolation.CLAMP
        ),
        paddingBottom: interpolate(
            expandProgress.value,
            [0, 1],
            [0, 18],
            Extrapolation.CLAMP
        ),
        overflow: "hidden",
    }));

    const averages = [
        { label: "Classe", value: discipline.averageDatas?.classAverage },
        { label: "Max.", value: discipline.averageDatas?.maxAverage },
        { label: "Min", value: discipline.averageDatas?.minAverage },
    ];

    const mainColor = colors?.surface?.card ?? "hsla(240, 11%, 20%, 1.00)";
    const secondaryColor = colors?.surface?.card ?? "hsl(240, 27%, 16%)";
    const txt1Color = colors?.text?.primary ?? colors?.text?.primary ?? "#FFFFFF";

    const boxStyle = {
        backgroundColor: addOpacityToCssRgb(mainColor, 0.3),
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    };

    const teachersText = Array.isArray(discipline.teachers)
        ? discipline.teachers.length > 1
            ? `${discipline.teachers[0]}...`
            : discipline.teachers[0] || ""
        : discipline.teachers || "";

    const calculatedUserAvg = discipline.getWeightedAverage();
    const userAverage =
        calculatedUserAvg !== null && calculatedUserAvg !== undefined
            ? calculatedUserAvg
            : discipline.averageDatas?.userAverage;

    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <Animated.View
                style={[
                    {
                        backgroundColor: secondaryColor,
                        overflow: "hidden",
                        borderWidth: isExpanded ? 1 : 0,
                        borderColor: discipline.color,
                    },
                    containerAnimatedStyle,
                ]}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        height: 80,
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 15,
                            flex: 1,
                        }}
                    >
                        <View style={{ marginLeft: -5 }}>
                            <SimpleFlamme
                                color={
                                    discipline.streakCount != 0 ? "orange" : "gray"
                                }
                                size={50}
                            />
                            <Text
                                align="center"
                                preset="h3"
                                style={{
                                    marginTop: -43,
                                    marginLeft: -2,
                                    fontSize: 22,
                                }}
                            >
                                {discipline.streakCount}
                            </Text>
                        </View>

                        <View
                            style={{
                                maxWidth: "68%",
                                flexShrink: 1,
                                marginLeft: -7,
                            }}
                        >
                            <Text
                                oneLine
                                style={{
                                    fontFamily: "Bold",
                                    fontSize: 18,
                                    color: discipline.color,
                                }}
                            >
                                {discipline.libelle}
                            </Text>
                            {teachersText.length > 0 && (
                                <Text
                                    style={{
                                        opacity: 0.72,
                                        fontFamily: "Medium",
                                        fontSize: 14,
                                        marginTop: -3,
                                    }}
                                    oneLine
                                >
                                    {teachersText}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View
                        style={{
                            width: 86,
                            height: 40,
                            backgroundColor: addOpacityToCssRgb(
                                discipline.color,
                                0.12
                            ),
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: addOpacityToCssRgb(discipline.color, 0.2),
                            borderRadius: 7,
                        }}
                    >
                        <Text
                            style={{
                                color: discipline.color,
                                fontFamily: "Bold",
                                fontSize: 26,
                                marginTop: -1,
                            }}
                        >
                            {formatGradeText(userAverage)}
                        </Text>
                    </View>
                </View>

                <Animated.View style={[{ gap: 8 }, contentAnimatedStyle]}>
                    <View
                        style={{
                            backgroundColor: addOpacityToCssRgb(txt1Color, 0.4),
                            height: 2,
                            borderRadius: 5,
                            marginHorizontal: 20,
                        }}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-around",
                            alignItems: "center",
                        }}
                    >
                        {averages.map(({ label, value }, idx) => (
                            <View
                                key={idx}
                                style={{
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <Text style={{ marginBottom: 8 }}>{label}</Text>
                                <View style={boxStyle}>
                                    <Text preset="label2">
                                        {formatGradeText(value)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {shouldRenderContent &&
                        discipline.grades
                            ?.filter((grade) => !grade.isSimulation)
                            .map((gradeData, idx) => {
                                const gradeObj = new Grade(gradeData);
                                return (
                                    <GradeItem
                                        key={`grade-${idx}`}
                                        grade={gradeObj}
                                        dispatch={dispatch}
                                    />
                                );
                            })}

                    {shouldRenderContent && (
                        <TouchableOpacity
                            onPress={() =>
                                dispatch({
                                    type: "OPEN_SIMULATION_MODAL",
                                    payload: {
                                        discipline: discipline.code,
                                        libelle: discipline.libelle,
                                    },
                                })
                            }
                            style={{ alignSelf: "center", marginVertical: 4 }}
                        >
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: addOpacityToCssRgb(
                                        mainColor,
                                        0.8
                                    ),
                                    width: 55,
                                    height: 30,
                                    borderRadius: 20,
                                }}
                            >
                                <Text preset="h3" align="center" marginTop={-3}>
                                    +
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {shouldRenderContent &&
                        discipline.grades
                            ?.filter((grade) => grade.isSimulation)
                            .map((gradeData, idx) => {
                                const gradeObj = new Grade(gradeData);
                                return (
                                    <SimulatedGradeItem
                                        key={`simulated-grade-${idx}`}
                                        grade={gradeObj}
                                        dispatch={dispatch}
                                    />
                                );
                            })}
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}

