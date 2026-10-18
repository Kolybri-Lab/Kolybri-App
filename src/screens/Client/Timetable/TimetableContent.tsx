// import VerticalScrollView from "@/components/layout/VerticalScrollView";
// import { RoadFinish } from "@/components/svg";
// import { CONFIG } from "@/constants/config";
// import { GLOBALS_DATAS } from "@/constants/device/globals";
// import { timetableConfig } from "@/constants/features/timetableConfig";

import { Text } from "@/components";
import { DayViewProps, useTimetable } from "@/features/timetable";
import { flattenDays } from "@/features/timetable/utils/sort";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useUserStore } from "@/hooks/useUserStore";
import dayjs from "dayjs";
import { memo, ReactNode, useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateSelector from "./components/DateSelector";
import DayPager from "./components/DayPager";
import DaySummary from "./components/DaySummary";
import ViewSelector from "./components/ViewSelector";

export default function TimetableContent() {
    const token = useUserStore((state) => state.token);
    const { data: weeks } = useTimetable(token);
    const { date: isoDate, frenchDate } = useCurrentTime();

    const days = useMemo(() => flattenDays(weeks), [weeks]);
    const [view, setView] = useState("day"); // "day" | "week"
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

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
            <ViewSelector onChange={setView} value={view} />
            <View style={{ marginTop: 24, alignSelf: "flex-start" }}>
                {day && (
                    <DateSelector
                        date={day}
                        onSelect={setSelectedDate}
                        minimumDate={dayjs(days[0].date).toDate()}
                        maximumDate={dayjs(days[days.length - 1].date).toDate()}
                    />
                )}
            </View>

            <View style={{ flex: 1 }}>
                <Panel visible={view === "day"}>
                    <DayView
                        dayIndex={dayIndex}
                        days={days}
                        setSelectedDate={setSelectedDate}
                        day={day}
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

const DayView = memo(({ days, dayIndex, setSelectedDate, day }: DayViewProps) => {
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
                <DayPager
                    days={days}
                    index={dayIndex}
                    onIndexChange={handleIndexChange}
                />
            )}
        </View>
    );
});
const WeekView = memo(({}) => {
    return (
        <View style={{ marginVertical: 14, width: "100%", flex: 1 }}>
            <Text>CACA</Text>
        </View>
    );
});
