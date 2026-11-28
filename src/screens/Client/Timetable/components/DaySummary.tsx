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
        return (
            day.items.reduce((acc, item) => {
                if (item.kind === "course") {
                    return acc + (Array.isArray(item.data) ? item.data.length : 1);
                }
                return acc;
            }, 0) ?? 0
        );
    }, [day]);

    const isLeaveDay = useMemo(() => {
        const hasCourses = day.items.some((item) => item.kind === "course");
        return (
            !hasCourses &&
            day.items.some(
                (item) => item.kind === "break" && item.data.type === "LEAVE"
            )
        );
    }, [day]);

    if (!infos)
        return (
            <Text
                preset="meta.md"
                weight="semibold"
                color={colors.text.secondary}
            >
                {isLeaveDay
                    ? "Aucun cours trouvé. Tu es libre !"
                    : "Aucune information sur la journée"}
            </Text>
        );

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
                preset="meta.md"
                weight="semibold"
                color={colors.text.secondary}
            >{`${totalCourses} cours · ${infos.firstHour} - ${infos.lastHour}`}</Text>
            <Text
                preset="badge.md"
                weight="medium"
                color={
                    infos.totalCancelled > 0
                        ? colors.text.onBrand
                        : colors.text.secondary
                }
                style={{
                    backgroundColor:
                        infos.totalCancelled > 0
                            ? colors.state.warning
                            : colors.surface.default,
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    borderRadius: 50,
                }}
            >{`${infos.totalCancelled} annulé${infos.totalCancelled > 1 ? "s" : ""}`}</Text>
            <Text
                preset="badge.md"
                weight="medium"
                color={
                    infos.totalEdited > 0
                        ? colors.text.onBrand
                        : colors.text.secondary
                }
                style={{
                    backgroundColor:
                        infos.totalEdited > 0
                            ? colors.brand.primary
                            : colors.surface.default,
                    paddingVertical: 2,
                    paddingHorizontal: 10,
                    borderRadius: 50,
                }}
            >{`${infos.totalEdited} modifié${infos.totalEdited > 1 ? "s" : ""}`}</Text>
        </View>
    );
}

