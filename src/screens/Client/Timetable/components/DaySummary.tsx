import { Text } from "@/components";
import { FlatDay } from "@/features/timetable";
import { useTheme } from "@/hooks/useThemeStore";
import { useMemo } from "react";
import { View } from "react-native";

interface DaySummaryProps {
    day: FlatDay;
}

export default function DaySummary({ day }: DaySummaryProps) {
    const { infos } = day;
    const { colors } = useTheme();

    const totalCourses = useMemo(() => {
        return day.items.filter((item) => item.kind === "course").length ?? 0;
    }, [day]);

    if (!infos)
        return (
            <Text
                color={colors.text.secondary}
                style={{ fontFamily: "SemiBold" }}
                size={15}
            >
                Aucune information sur la journée
            </Text>
        );

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
                color={colors.text.secondary}
                style={{ fontFamily: "SemiBold" }}
                size={15}
            >{`${totalCourses} cours · ${infos.firstHour} - ${infos.lastHour}`}</Text>
            <Text
                color={colors.text.onBrand}
                size={15}
                style={{
                    backgroundColor: "hsl(215, 28%, 17%)",
                    paddingVertical: 2,
                    paddingHorizontal: 14,
                    borderRadius: 50,
                    fontFamily: "Medium",
                }}
            >{`${infos.totalCancelled} annulé${infos.totalCancelled > 1 ? "s" : ""}`}</Text>
            <Text
                color={colors.text.onBrand}
                size={15}
                style={{
                    backgroundColor: "hsl(193, 82%, 31%)",
                    paddingVertical: 2,
                    paddingHorizontal: 14,
                    borderRadius: 50,
                    fontFamily: "Medium",
                }}
            >{`${infos.totalEdited} modifié${infos.totalCancelled > 1 ? "s" : ""}`}</Text>
        </View>
    );
}
