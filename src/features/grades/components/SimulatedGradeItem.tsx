import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/core";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useTheme } from "@/hooks/useThemeStore";
import { withAlpha } from "@/themes/color";
import Grade from "../models/Grade";

interface SimulatedGradeItemProps {
    grade: Grade;
    dispatch: (action: any) => void;
}

export default function SimulatedGradeItem({
    grade,
    dispatch,
}: SimulatedGradeItemProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={{
                flexDirection: "row",
                marginHorizontal: 20,
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: withAlpha(colors.brand.primary, 0.15),
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                borderColor: colors.brand.primary,
                borderWidth: 1,
            }}
            onPress={() => {
                dispatch({
                    type: "REMOVE_SIMULATED_GRADE",
                    payload: grade.getGrade(),
                });
            }}
        >
            <Text
                style={{ flexShrink: 1 }}
                oneLine
                preset="cardTitle.sm"
                weight="medium"
            >
                {grade.libelle}
            </Text>
            <Text preset="metric.sm">
                {formatGradeText(grade.data?.grade)}
                {grade.data?.outOf !== 20 &&
                    grade.data?.outOf !== null &&
                    grade.data?.outOf !== undefined && (
                        <Text preset="meta.sm">
                            {`/${grade.data.outOf}`}
                        </Text>
                    )}
            </Text>
        </TouchableOpacity>
    );
}
