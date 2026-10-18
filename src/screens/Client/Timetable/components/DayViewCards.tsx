import { Text } from "@/components";
import { Person } from "@/components/svg";
import { Break, Course } from "@/features/timetable";
import { isLunchBreak } from "@/features/timetable/utils/sort";
import { useTheme } from "@/hooks/useThemeStore";
import { Coffee, ForkKnife, MapPin } from "lucide-react-native";
import { memo } from "react";
import { View } from "react-native";

interface DayViewCourseProps {
    course: Course;
}
interface DayViewBreakProps {
    breakItem: Break;
}
function DayViewCourseComponent({ course: course }: DayViewCourseProps) {
    const { colors } = useTheme();
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "stretch",
            }}
        >
            <View
                style={{
                    width: 68,
                    justifyContent: "space-between",
                }}
            >
                <Text size={16} style={{ fontFamily: "Medium" }}>
                    {course.schedules.start.time}
                </Text>
                <Text
                    size={14}
                    color={colors.text.secondary}
                    style={{ fontFamily: "Medium" }}
                >
                    {course.schedules.end.time}
                </Text>
            </View>
            <View
                style={{
                    flex: 1,
                    minHeight: course.dayView.height,
                    backgroundColor: "hsl(229, 83%, 91%)",
                    borderRadius: 18,
                    padding: 14,
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <View
                            style={{
                                width: 10,
                                aspectRatio: 1,
                                borderRadius: 50,
                                backgroundColor: "hsl(226, 72%, 33%)",
                            }}
                        />
                        <Text color="#17338F">{course.libelle}</Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: colors.surface.default,
                            paddingHorizontal: 10,
                            borderRadius: 50,
                        }}
                    >
                        <Text
                            size={14}
                            color="#17338F"
                            style={{ fontFamily: "SemiBold" }}
                        >
                            {course.schedules.duration.text.replace(":", "h")}
                        </Text>
                    </View>
                </View>
                <View
                    style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                        }}
                    >
                        <Person fill={colors.text.secondary} size={15} />
                        <Text
                            color={colors.text.secondary}
                            size={15}
                            style={{ fontFamily: "Medium" }}
                        >
                            {course.teacher}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                        }}
                    >
                        <MapPin
                            strokeWidth={2.5}
                            stroke={colors.text.secondary}
                            size={15}
                        />
                        <Text
                            color={colors.text.secondary}
                            size={15}
                            style={{ fontFamily: "Medium" }}
                        >
                            {course.room}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
function DayViewBreakComponent({ breakItem: breakItem }: DayViewBreakProps) {
    const { colors } = useTheme();
    const lunchBreak = isLunchBreak(breakItem);
    return (
        <View
            style={{
                flexDirection: "row",
                backgroundColor: colors.surface.default,
                marginLeft: 68,
                borderRadius: 18,
                borderColor: colors.border.subtle,
                borderWidth: 1,
                height: breakItem?.dayView?.height || "100%",
                padding: 12,
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                    style={{
                        backgroundColor: colors.surface.raised,
                        aspectRatio: 1,
                        height: 35,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {lunchBreak ? (
                        <ForkKnife size={20} stroke={colors.text.primary} />
                    ) : (
                        <Coffee size={20} stroke={colors.text.primary} />
                    )}
                </View>
                <View style={{ justifyContent: "space-between" }}>
                    <Text
                        style={{ fontFamily: "SemiBold", lineHeight: 14 }}
                        size={14}
                    >
                        {lunchBreak ? "Pause méridienne" : "Pause"}
                    </Text>
                    <Text
                        size={12}
                        color={colors.text.secondary}
                        style={{ fontFamily: "SemiBold", lineHeight: 12 }}
                    >{`${breakItem.schedules.start.time} - ${breakItem.schedules.end.time}`}</Text>
                </View>
            </View>
            <View
                style={{
                    backgroundColor: colors.brand.primary,
                    alignSelf: "center",
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 50,
                }}
            >
                <Text
                    size={14}
                    color={colors.text.onBrand}
                    style={{ fontFamily: "SemiBold", lineHeight: 12 }}
                >
                    {breakItem.schedules.duration.text.replace(":", "h")}
                </Text>
            </View>
        </View>
    );
}

export const DayViewCourse = memo(DayViewCourseComponent);
export const DayViewBreak = memo(DayViewBreakComponent);
