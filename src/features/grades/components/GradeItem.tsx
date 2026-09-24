import { Text as CoreText } from "@/components/core";
import {
    BestGrade,
    EqualToDisciplineAverage,
    MaxGrade,
    UpperThanClassAverage,
    UpperThanDisciplineAverage,
    UpTheStreak,
} from "@/components/svg";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useTheme } from "@/hooks/useThemeStore";
import { TouchableOpacity, View } from "react-native";
import Grade from "../models/Grade";
const Text = CoreText as any;

interface GradeItemProps {
    grade: Grade;
    dispatch: (action: any) => void;
}

const UI_BADGES: Record<string, any> = {
    max_grade: MaxGrade,
    best_grade: BestGrade,
    upper_than_class_average: UpperThanClassAverage,
    upper_than_discipline_average: UpperThanDisciplineAverage,
    up_the_streak: UpTheStreak,
    equal_to_discipline_average: EqualToDisciplineAverage,
};

export default function GradeItem({ grade, dispatch }: GradeItemProps) {
    const { colors } = useTheme() as any;
    const softColor = colors?.brand?.soft ?? "hsl(240, 95%, 85%)";

    let backgroundColor = softColor;
    switch (grade.actionOnStreak) {
        case "nothing":
            backgroundColor = softColor;
            break;
        case "up":
            backgroundColor = "hsla(36, 100%, 34%, .35)";
            break;
        case "previous up":
            backgroundColor = "hsla(36, 10%, 41%, .3)";
            break;
    }

    const borderColor = colors?.border?.subtle ?? "hsla(240, 62%, 58%, 0.2)";

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
                dispatch({
                    type: "SEE_GRADE_DETAILS",
                    payload: grade.getGrade(),
                })
            }
        >
            <View
                style={{
                    flexDirection: "row",
                    marginHorizontal: 20,
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderColor,
                    borderWidth: 1,
                }}
            >
                <Text style={{ flexShrink: 1 }} oneLine preset="label2">
                    {grade.libelle}
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        gap: 10,
                        marginHorizontal: 10,
                    }}
                >
                    {grade.badges &&
                        grade.badges.map((badge, i) => {
                            const BadgeComponent = UI_BADGES[badge];
                            if (!BadgeComponent) return null;
                            return (
                                <BadgeComponent key={`${badge}-${i}`} size={22} />
                            );
                        })}
                </View>
                <Text preset="label1">
                    {grade.notSignificant
                        ? `(${formatGradeText(grade.data?.grade)})`
                        : formatGradeText(grade.data?.grade)}
                    {grade.data?.outOf !== 20 &&
                        grade.data?.outOf !== null &&
                        grade.data?.outOf !== undefined && (
                            <Text preset="label3">{`/${grade.data.outOf}`}</Text>
                        )}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

