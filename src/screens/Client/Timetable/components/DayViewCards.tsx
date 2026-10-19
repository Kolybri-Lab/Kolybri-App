import { Text } from "@/components";
import { Person } from "@/components/svg";
import { Break, Course } from "@/features/timetable";
import { isLunchBreak } from "@/features/timetable/utils/sort";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import { fontFamily } from "@/themes/tokens";
import { Coffee, ForkKnife, MapPin } from "lucide-react-native";
import { memo, useMemo } from "react";
import { View } from "react-native";

interface DayViewCourseProps {
    course: Course | Course[];
}
interface DayViewBreakProps {
    breakItem: Break;
}

interface CourseCardItemProps {
    course: Course;
    isMulti: boolean;
    slotHeight: number;
    colors: any;
}

function CourseCardItem({
    course,
    isMulti,
    slotHeight,
    colors,
}: CourseCardItemProps) {
    return (
        <View
            style={{
                flex: 1,
                minHeight: slotHeight,
                backgroundColor: colors.surface.default,
                borderRadius: 18,
                overflow: "hidden",
                opacity: course.states?.cancelled ? 0.6 : 1,
            }}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: "space-between",
                    padding: isMulti ? 10 : 14,
                    backgroundColor: course.states?.cancelled
                        ? withAlpha(colors.state.danger, 0.3)
                        : course.states?.edited
                          ? withAlpha(colors.brand.primary, 0.3)
                          : course.states?.dispensed
                            ? withAlpha(colors.text.secondary, 0.3)
                            : "transparent",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                            gap: 6,
                        }}
                    >
                        <View
                            style={{
                                width: isMulti ? 8 : 10,
                                aspectRatio: 1,
                                borderRadius: 50,
                                backgroundColor: course.color,
                                flexShrink: 0,
                            }}
                        />
                        <Text
                            color={course.color}
                            oneLine
                            style={{
                                flex: 1,
                                fontFamily: "SemiBold",
                                fontSize: isMulti ? 14 : 16,
                                textDecorationLine: course.states?.cancelled
                                    ? "line-through"
                                    : "none",
                            }}
                        >
                            {course.libelle}
                        </Text>
                    </View>
                    {!isMulti && (
                        <View
                            style={{
                                backgroundColor: colors.brand.soft,
                                paddingHorizontal: 10,
                                borderRadius: 50,
                                flexShrink: 0,
                            }}
                        >
                            <Text
                                size={14}
                                color={colors.text.primary}
                                style={{ fontFamily: "SemiBold" }}
                            >
                                {course.schedules.duration.text.replace(":", "h")}
                            </Text>
                        </View>
                    )}
                </View>
                <View
                    style={{
                        flexDirection: isMulti ? "column" : "row",
                        alignItems: isMulti ? "flex-start" : "center",
                        gap: isMulti ? 4 : 10,
                    }}
                >
                    {course.teacher ? (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 3,
                                flexShrink: 1,
                            }}
                        >
                            <Person
                                fill={colors.text.secondary}
                                size={isMulti ? 13 : 15}
                            />
                            <Text
                                color={colors.text.secondary}
                                size={isMulti ? 13 : 15}
                                style={{ fontFamily: "Medium" }}
                                oneLine
                            >
                                {course.teacher}
                            </Text>
                        </View>
                    ) : null}
                    {course.room ? (
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 3,
                                flexShrink: 1,
                            }}
                        >
                            <MapPin
                                strokeWidth={2.5}
                                stroke={colors.text.secondary}
                                size={isMulti ? 13 : 15}
                            />
                            <Text
                                color={colors.text.secondary}
                                size={isMulti ? 13 : 15}
                                style={{ fontFamily: "Medium" }}
                                oneLine
                            >
                                {course.room}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

function DayViewCourseComponent({ course }: DayViewCourseProps) {
    const { colors } = useTheme();
    const coursesList = useMemo(() => {
        return Array.isArray(course) ? course : course ? [course] : [];
    }, [course]);

    if (coursesList.length === 0) return null;

    const startTime = coursesList.reduce(
        (min, c) => (c.schedules.start.time < min ? c.schedules.start.time : min),
        coursesList[0].schedules.start.time
    );
    const endTime = coursesList.reduce(
        (max, c) => (c.schedules.end.time > max ? c.schedules.end.time : max),
        coursesList[0].schedules.end.time
    );
    const slotHeight = Math.max(...coursesList.map((c) => c.dayView.height));
    const isMulti = coursesList.length > 1;

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
                    {startTime}
                </Text>
                <Text
                    size={14}
                    color={colors.text.secondary}
                    style={{ fontFamily: "Medium" }}
                >
                    {endTime}
                </Text>
            </View>
            <View
                style={{
                    flex: 1,
                    flexDirection: "row",
                    gap: 8,
                }}
            >
                {coursesList.map((item) => (
                    <CourseCardItem
                        key={item.id}
                        course={item}
                        isMulti={isMulti}
                        slotHeight={slotHeight}
                        colors={colors}
                    />
                ))}
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
                        style={{ fontFamily: "SemiBold", lineHeight: 16 }}
                        size={14}
                    >
                        {lunchBreak ? "Pause méridienne" : "Pause"}
                    </Text>
                    <Text
                        size={12}
                        color={colors.text.secondary}
                        style={{ fontFamily: "SemiBold", lineHeight: 16 }}
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

