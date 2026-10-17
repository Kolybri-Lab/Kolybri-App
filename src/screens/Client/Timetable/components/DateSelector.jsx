import { Text } from "@/components";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useTheme } from "@/hooks/useThemeStore";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { Pressable, View } from "react-native";

const getRelativeLabel = (date, today) => {
    const diff = dayjs(date).startOf("day").diff(dayjs(today).startOf("day"), "day");
    if (diff === 0) return "Aujourd'hui";
    if (diff === -1) return "Hier";
    if (diff === 1) return "Demain";
    return null;
};

export default function DateSelector({ date, onSelect, minimumDate, maximumDate }) {
    const { colors } = useTheme();
    const { date: isoDate } = useCurrentTime();

    const relativeLabel = isoDate ? getRelativeLabel(date.date, isoDate) : null;

    const open = () => {
        DateTimePickerAndroid.open({
            value: dayjs(date.date).toDate(),
            mode: "date",
            minimumDate,
            maximumDate,
            onValueChange: (_, selected) => {
                const iso = dayjs(selected).format("YYYY-MM-DD");
                if (iso !== date.date) onSelect(iso);
            },
        });
    };

    return (
        <View style={{ gap: 4 }}>
            {relativeLabel && (
                <View
                    style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
                >
                    <View
                        style={{
                            width: 8,
                            aspectRatio: 1,
                            backgroundColor: colors.text.accent,
                            borderRadius: 20,
                        }}
                    />
                    <Text
                        color={colors.text.accent}
                        size={16}
                        style={{ fontFamily: "Medium" }}
                    >
                        {relativeLabel}
                    </Text>
                </View>
            )}

            <Pressable
                onPress={open}
                accessibilityRole="button"
                accessibilityLabel="Choisir une date"
                style={{
                    backgroundColor: colors.surface.default,
                    paddingHorizontal: 20,
                    paddingVertical: 4,
                    borderRadius: 50,
                }}
            >
                <Text size={20} style={{ fontFamily: "SemiBold" }}>
                    {date.fullDate}
                </Text>
            </Pressable>
        </View>
    );
}

