// import VerticalScrollView from "@/components/layout/VerticalScrollView";
// import { RoadFinish } from "@/components/svg";
// import { CONFIG } from "@/constants/config";
// import { GLOBALS_DATAS } from "@/constants/device/globals";
// import { timetableConfig } from "@/constants/features/timetableConfig";

import { Text } from "@/components/core";
import { useTimetable } from "@/features/timetable";
import { useUserStore } from "@/hooks/useUserStore";

export default function TimetableContent() {
    const token = useUserStore((state) => state.token);
    const { data: gradesData, isLoading, isError } = useTimetable(token);
    console.log(gradesData);
    return <Text>Hello World !</Text>;
}

