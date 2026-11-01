import { Selector, Text } from "@/components";
import { DayViewProps, useTimetable } from "@/features/timetable";
import { flattenDays } from "@/features/timetable/utils/sort";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import dayjs from "dayjs";
import { Calendar1, CalendarCheck, CalendarRange } from "lucide-react-native";
import { memo, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import DayPager from "./components/DayPager";
import DaySummary from "./components/DaySummary";

export default function TimetableContent() {
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const {
        data: weeks,
        extendForward,
        extendBackward,
    } = useTimetable(token, selectedDate);
    const { date: isoDate } = useCurrentTime();

    const days = useMemo(() => flattenDays(weeks), [weeks]);
    const [view, setView] = useState("day"); // "day" | "week"

    const isToday = selectedDate === (isoDate || dayjs().format("YYYY-MM-DD"));

    const dayIndex = useMemo(() => {
        if (days.length === 0) return -1;
        const exact = days.findIndex((d) => d.date === selectedDate);
        if (exact !== -1) return exact;
        const next = days.findIndex((d) => d.date > selectedDate);
        return next !== -1 ? next : days.length - 1;
    }, [days, selectedDate]);

    const day = useMemo(() => days[dayIndex], [days, dayIndex]);

    const goToToday = useCallback(() => {
        setSelectedDate(isoDate || dayjs().format("YYYY-MM-DD"));
    }, [isoDate]);

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, marginHorizontal: 22 }}>
            {/* <ViewSelector onChange={setView} value={view} /> */}
            <View
                style={{
                    marginTop: 24,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    width: "100%",
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: 8,
                        minWidth: 0,
                    }}
                >
                    {day && (
                        <Selector
                            type="dateselector"
                            text={day.fullDate}
                            date={day.date}
                            onSelect={setSelectedDate}
                        />
                    )}

                    <TodayButton isToday={isToday} onPress={goToToday} />
                </View>

                <Pressable
                    disabled
                    style={{
                        padding: 8,
                        backgroundColor: colors.surface.default,
                        borderRadius: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.4,
                        marginLeft: 8,
                        flexShrink: 0,
                    }}
                >
                    {view === "day" ? (
                        <Calendar1 size={24} color={colors.text.secondary} />
                    ) : (
                        <CalendarRange size={24} color={colors.text.secondary} />
                    )}
                </Pressable>
            </View>

            <View style={{ flex: 1 }}>
                <Panel visible={view === "day"}>
                    <DayView
                        dayIndex={dayIndex}
                        days={days}
                        setSelectedDate={setSelectedDate}
                        day={day}
                        extendForward={extendForward}
                        extendBackward={extendBackward}
                    />
                </Panel>

                <Panel visible={view === "week"}>
                    <WeekView />
                </Panel>
            </View>
        </SafeAreaView>
    );
}

const BUTTON_SIZE = 40; // 24 (size) + 2 × 8 (padding)
const BUTTON_GAP = 8;
const ROLL_DISTANCE = BUTTON_SIZE + BUTTON_GAP; // 48 px
const ROLL_ROTATION = (ROLL_DISTANCE / (BUTTON_SIZE / 2)) * (180 / Math.PI); // ≈ 137.5°

const TodayButton = memo(
    ({ isToday, onPress }: { isToday: boolean; onPress: () => void }) => {
        const { colors } = useTheme();
        const progress = useSharedValue(isToday ? 1 : 0);

        useEffect(() => {
            progress.value = withTiming(isToday ? 1 : 0, {
                duration: 250,
                easing: Easing.linear,
            });
        }, [isToday, progress]);

        const animatedStyle = useAnimatedStyle(() => ({
            marginLeft: interpolate(progress.value, [0, 1], [0, -ROLL_DISTANCE]),
            opacity: interpolate(progress.value, [0, 1], [1, 0]),
            transform: [
                {
                    rotate: `${interpolate(
                        progress.value,
                        [0, 1],
                        [0, -ROLL_ROTATION]
                    )}deg`,
                },
            ],
        }));

        return (
            <Animated.View
                pointerEvents={isToday ? "none" : "auto"}
                style={[{ zIndex: -1, flexShrink: 0 }, animatedStyle]}
            >
                <Pressable
                    onPress={onPress}
                    style={({ pressed }) => ({
                        padding: 8,
                        backgroundColor: colors.surface.default,
                        borderRadius: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.7 : 1,
                    })}
                >
                    <CalendarCheck size={24} color={colors.text.primary} />
                </Pressable>
            </Animated.View>
        );
    }
);

const Panel = memo(
    ({ visible, children }: { visible: boolean; children: ReactNode }) => (
        <View
            pointerEvents={visible ? "auto" : "none"}
            style={{
                flex: 1,
                display: visible ? "flex" : "none",
            }}
        >
            {children}
        </View>
    )
);

const DayView = memo(
    ({
        days,
        dayIndex,
        setSelectedDate,
        day,
        extendForward,
        extendBackward,
    }: DayViewProps) => {
        const handleIndexChange = useCallback(
            (i: number) => {
                const target = days[i];
                if (target) setSelectedDate(target.date);
            },
            [days, setSelectedDate]
        );

        return (
            <View style={{ marginVertical: 14, width: "100%", flex: 1 }}>
                <View style={{ marginVertical: 14 }}>
                    {day && <DaySummary day={day} />}
                </View>
                {dayIndex >= 0 && (
                    <View style={{ flex: 1, marginHorizontal: -22 }}>
                        <DayPager
                            days={days}
                            index={dayIndex}
                            onIndexChange={handleIndexChange}
                            onExtendForward={extendForward}
                            onExtendBackward={extendBackward}
                        />
                    </View>
                )}
            </View>
        );
    }
);

const WeekView = memo(({}) => {
    return (
        <View style={{ marginVertical: 14, width: "100%", flex: 1 }}>
            <Text>CACA</Text>
        </View>
    );
});

