import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text as CoreText } from "@/components/core";
const Text = CoreText as any;
import { formatGradeText } from "@/features/grades/utils/helpers";
import Grade from "../models/Grade";

interface SimulatedGradeItemProps {
    grade: Grade;
    dispatch: (action: any) => void;
}

export default function SimulatedGradeItem({
    grade,
    dispatch,
}: SimulatedGradeItemProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={{
                flexDirection: "row",
                marginHorizontal: 20,
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "hsla(206, 60%, 28%, 0.4)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                borderColor: "hsl(206, 60%, 48%)",
                borderWidth: 1,
            }}
            onPress={() => {
                dispatch({
                    type: "REMOVE_SIMULATED_GRADE",
                    payload: grade.getGrade(),
                });
            }}
        >
            <Text style={{ flexShrink: 1 }} oneLine preset="label2">
                {grade.libelle}
            </Text>
            <Text preset="label1">
                {formatGradeText(grade.data?.grade)}
                {grade.data?.outOf !== 20 &&
                    grade.data?.outOf !== null &&
                    grade.data?.outOf !== undefined && (
                        <Text preset="label3">
                            {`/${grade.data.outOf}`}
                        </Text>
                    )}
            </Text>
        </TouchableOpacity>
    );
}
