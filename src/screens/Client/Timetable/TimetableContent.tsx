// import VerticalScrollView from "@/components/layout/VerticalScrollView";
// import { RoadFinish } from "@/components/svg";
// import { CONFIG } from "@/constants/config";
// import { GLOBALS_DATAS } from "@/constants/device/globals";
// import { timetableConfig } from "@/constants/features/timetableConfig";

import { useTimetable } from "@/features/timetable";
import { flattenDays } from "@/features/timetable/utils/sort";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useUserStore } from "@/hooks/useUserStore";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
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

    const day = days[dayIndex];

    const goTo = useCallback(
        (delta) => {
            const target = days[dayIndex + delta];
            if (target) setSelectedDate(target.date);
        },
        [days, dayIndex]
    );
    return (
        <SafeAreaView
            edges={["top"]}
            style={{ flex: 1, marginHorizontal: 22, alignItems: "flex-start" }}
        >
            {/* <Text>Hello World !</Text> */}
            <ViewSelector onChange={setView} value={view} />
            <View style={{ marginTop: 24 }}>
                {day && (
                    <DateSelector
                        date={day}
                        onSelect={setSelectedDate}
                        minimumDate={dayjs(days[0].date).toDate()}
                        maximumDate={dayjs(days[days.length - 1].date).toDate()}
                    />
                )}
            </View>
            <View style={{ marginVertical: 14 }}>
                {day && <DaySummary day={day} />}
            </View>
            <View style={{ marginVertical: 14, width: "100%", flex: 1 }}>
                {dayIndex >= 0 && (
                    <DayPager
                        days={days}
                        index={dayIndex}
                        onIndexChange={(i) => setSelectedDate(days[i].date)}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
