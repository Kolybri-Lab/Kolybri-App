// import VerticalScrollView from "@/components/layout/VerticalScrollView";
// import { RoadFinish } from "@/components/svg";
// import { CONFIG } from "@/constants/config";
// import { GLOBALS_DATAS } from "@/constants/device/globals";
// import { timetableConfig } from "@/constants/features/timetableConfig";

import { Text } from "@/components";
import { DayViewProps, useTimetable } from "@/features/timetable";
import { flattenDays } from "@/features/timetable/utils/sort";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import dayjs from "dayjs";
import { Calendar1, CalendarCheck, CalendarRange } from "lucide-react-native";
import { memo, ReactNode, useCallback, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import DateSelector from "./components/DateSelector";
import DayPager from "./components/DayPager";
import DaySummary from "./components/DaySummary";
import ViewSelector from "./components/ViewSelector";

export default function TimetableContent() {
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const {
        data: weeks,
        extendForward,
        extendBackward,
    } = useTimetable(token);
    const { date: isoDate, frenchDate } = useCurrentTime();

    const days = useMemo(() => flattenDays(weeks), [weeks]);
    const [view, setView] = useState("day"); // "day" | "week"
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

    const isToday = selectedDate === (isoDate || dayjs().format("YYYY-MM-DD"));

    const dayIndex = useMemo(() => {
        if (days.length === 0) return -1;
        const exact = days.findIndex((d) => d.date === selectedDate);
        if (exact !== -1) return exact;
        const next = days.findIndex((d) => d.date > selectedDate);
        return next !== -1 ? next : days.length - 1;
    }, [days, selectedDate]);

    const day = useMemo(() => days[dayIndex], [days, dayIndex]);

    return (
        <SafeAreaView edges={["top"]} style={{ flex: 1, marginHorizontal: 22 }}>
            {/*<ViewSelector onChange={setView} value={view} />*/}
            <View
                style={{
                    marginTop: 24,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    width: "100%",
                }}
            >
                <Animated.View
                    layout={LinearTransition.springify().duration(250)}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "flex-end",
                        gap: 8,
                        minWidth: 0,
                    }}
                >
                    {day && (
                        <DateSelector
                            date={day}
                            onSelect={setSelectedDate}
                            minimumDate={dayjs(days[0].date).toDate()}
                            maximumDate={dayjs(days[days.length - 1].date).toDate()}
                        />
                    )}

                    <Animated.View
                        layout={LinearTransition.springify().duration(250)}
                        style={{
                            marginLeft: isToday ? -48 : 0,
                            zIndex: -1,
                            flexShrink: 0,
                        }}
                    >
                        <Pressable
                            onPress={() =>
                                setSelectedDate(
                                    isoDate || dayjs().format("YYYY-MM-DD")
                                )
                            }
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
                </Animated.View>

                <Pressable
                    onPress={() =>
                        setView((prev) => (prev === "day" ? "week" : "day"))
                    }
                    style={({ pressed }) => ({
                        padding: 8,
                        backgroundColor: colors.surface.default,
                        borderRadius: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.7 : 1,
                        marginLeft: 8,
                        flexShrink: 0,
                    })}
                >
                    {view === "day" ? (
                        <Calendar1 size={24} color={colors.text.primary} />
                    ) : (
                        <CalendarRange size={24} color={colors.text.primary} />
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

