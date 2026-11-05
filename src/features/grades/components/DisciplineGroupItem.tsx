import React from "react";
import { View } from "react-native";
import { Text as CoreText } from "@/components/core";
const Text = CoreText as any;
import { formatGradeText } from "@/features/grades/utils/helpers";
import Discipline from "../models/Discipline";
import DisciplineItem from "./DisciplineItem";

interface DisciplineGroupItemProps {
    group: any;
    groupIndex?: number;
    expandedChain: string | null;
    onItemPress: (chain: string) => void;
    dispatch: (action: any) => void;
}

export default function DisciplineGroupItem({
    group,
    groupIndex = 0,
    expandedChain,
    onItemPress,
    dispatch,
}: DisciplineGroupItemProps) {
    const groupObj = new Discipline(group);
    const disciplines = group.disciplines || [];
    const calculatedGroupAvg = groupObj.getDisciplineGroupAverage();
    const userAverage =
        calculatedGroupAvg !== null && calculatedGroupAvg !== undefined
            ? calculatedGroupAvg
            : groupObj.averageDatas?.userAverage;
    const title = groupObj.libelle || group.name || "Matières";

    return (
        <View style={{ gap: 4 }}>
            {/* Header du groupe (Titre + Moyenne) */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    overflow: "hidden",
                    paddingHorizontal: 8,

                    paddingVertical: 2,
                }}
            >
                <Text style={{ fontFamily: "SemiBold", fontSize: 20 }}>{title}</Text>
                {userAverage !== null && userAverage !== undefined && (
                    <Text style={{ fontFamily: "SemiBold", fontSize: 20 }}>
                        {formatGradeText(userAverage)}
                    </Text>
                )}
            </View>

            {/* Liste des matières du groupe */}
            <View style={{ gap: 8 }}>
                {disciplines.map((item: any, dIndex: number) => {
                    const discipline = new Discipline(item);
                    const chain = `${discipline.code}-${discipline.libelle}`;
                    const isFirst = dIndex === 0;
                    const isLast = dIndex === disciplines.length - 1;

                    return (
                        <DisciplineItem
                            key={
                                item.id
                                    ? `disc-${item.id}`
                                    : `g${groupIndex}-d${dIndex}-${discipline.code || discipline.libelle}`
                            }
                            discipline={discipline}
                            index={dIndex}
                            dataLength={disciplines.length}
                            isFirst={isFirst}
                            isLast={isLast}
                            isExpanded={expandedChain === chain}
                            onPress={() => onItemPress(chain)}
                            dispatch={dispatch}
                        />
                    );
                })}
            </View>
        </View>
    );
}

