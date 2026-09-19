import { useTheme } from "@/hooks/useThemeStore";

import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DropDownMenu } from "@/components";
import { API } from "@/constants/api/api";
import { useGrades } from "@/features/grades";
import DisciplineGroupItem from "@/features/grades/components/DisciplineGroupItem";
import GradeFlame from "@/features/grades/components/GradeFlame";
import AddGradeModal from "@/features/grades/components/SimulateGradeModal";
import { useGrade } from "@/features/grades/context/GradeContext";
import { useSimulation } from "@/features/grades/hooks/useSimulation";
import Period from "@/features/grades/models/Period";
import { formatGradeText } from "@/features/grades/utils/helpers";
import { useUserStore } from "@/hooks/useUserStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GradesContent() {
    const { colors, shadow } = useTheme();

    const token = useUserStore((state) => state.token);
    const { data: gradesData, isLoading, isError } = useGrades(token);
    const { state, dispatch } = useGrade();
    const [periodes, setPeriodes] = useState([]);
    const [displayPeriode, setDisplayPeriode] = useState({});
    const [displayPeriodeName, setDisplayPeriodeName] = useState(
        API.DEFAULT_PERIOD_KEY
    );
    const [generalAverage, setGeneralAverage] = useState(0);
    const [globalStreakScore, setGlobalStreakScore] = useState(0);

    const [renderDisciplinesArray, setRenderDisciplineArray] = useState([]);
    const [expandedChain, setExpandedChain] = useState(null);

    const [simulatedDisciplineCodes, setSimulatedDisciplineCodes] = useState({});

    useSimulation({
        dispatch,
        displayPeriodeName,
        setSimulatedDisciplineCodes,
        state,
        setRenderDisciplineArray,
        renderDisciplinesArray,
        displayPeriode,
        setDisplayPeriode,
        setGeneralAverage,
    });

    const fetchAndProcessGrades = useCallback(() => {
        try {
            const validPeriodEntries = Object.entries(gradesData).filter(
                ([key, val]) =>
                    key !== "lastGrades" &&
                    key !== "activePeriod" &&
                    val &&
                    typeof val === "object" &&
                    val.groups
            );

            const formattedPeriodes = validPeriodEntries.map(
                ([value, { periodName }]) => ({
                    label: periodName,
                    value,
                })
            );

            setPeriodes(formattedPeriodes);

            const initialPeriodKey =
                gradesData.activePeriod?.periodCode ||
                (gradesData[API.DEFAULT_PERIOD_KEY]
                    ? API.DEFAULT_PERIOD_KEY
                    : validPeriodEntries[0]?.[0]);

            if (initialPeriodKey && gradesData[initialPeriodKey]) {
                setDisplayPeriode(gradesData[initialPeriodKey]);
                setDisplayPeriodeName(initialPeriodKey);
            }
        } catch (err) {
            console.error("Error while loading grades:", err);
        }
    }, [gradesData]);

    useEffect(() => {
        if (!gradesData || Object.keys(gradesData).length === 0) return;
        fetchAndProcessGrades();
    }, [gradesData]);

    useEffect(() => {
        if (!displayPeriode || Object.keys(displayPeriode).length === 0) return;

        try {
            setRenderDisciplineArray(flattenDisciplines(displayPeriode.groups));
            setGeneralAverage(
                new Period(displayPeriode, displayPeriodeName).makeGeneralAverage()
            );

            setGlobalStreakScore(displayPeriode.globalStreakScore);
        } catch (error) {
            console.error("Error when try to load periods:", error);
        }
    }, [displayPeriode]);

    const handleItemPress = useCallback((chain) => {
        setExpandedChain((prev) => (prev === chain ? null : chain));
    }, []);

    const styles = createStyles(colors, shadow);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {periodes.length > 0 && (
                    <SafeAreaView
                        style={{
                            zIndex: 10,
                            marginTop: 20,
                            marginLeft: 20,
                        }}
                    >
                        <DropDownMenu
                            value={
                                periodes.find(
                                    (p) =>
                                        p.value === displayPeriodeName ||
                                        p.id === displayPeriodeName
                                ) || periodes[0]
                            }
                            onSelect={(item) => {
                                const value = item?.value ?? item?.id ?? item;
                                const changedPeriod = gradesData[value];
                                setDisplayPeriode(changedPeriod);
                                setDisplayPeriodeName(value);
                            }}
                            options={periodes}
                            minWidth="200"
                        />
                    </SafeAreaView>
                )}
                <View style={styles.flammesContainer}>
                    <GradeFlame
                        color="orange"
                        value={globalStreakScore}
                        label="Streak"
                        width="30%"
                    />
                    <GradeFlame
                        color="violet"
                        value={formatGradeText(generalAverage)}
                        label="Moyenne"
                        width="30%"
                    />
                </View>

                <View
                    style={{
                        gap: 16,
                        paddingHorizontal: 18,
                        marginTop: 30,
                    }}
                >
                    {displayPeriode.groups?.map((group, gIndex) => (
                        <DisciplineGroupItem
                            key={`group-${group.libelle || group.name || gIndex}-${gIndex}`}
                            group={group}
                            groupIndex={gIndex}
                            expandedChain={expandedChain}
                            onItemPress={handleItemPress}
                            dispatch={dispatch}
                        />
                    ))}
                </View>
                <View style={{ height: 25 }} />
            </ScrollView>

            <AddGradeModal
                visible={state.simulation.modalOpen}
                disciplineCodes={simulatedDisciplineCodes}
            />
        </View>
    );
}

function flattenDisciplines(groups) {
    const result = [];

    groups?.forEach((group) => {
        result.push(group);

        if (Array.isArray(group.disciplines)) {
            group.disciplines.forEach((discipline) => {
                result.push(discipline);
            });
        }
    });

    return result;
}

const createStyles = (colors, shadow) =>
    StyleSheet.create({
        flammesContainer: {
            zIndex: -1,
            marginTop: 10,
            flexDirection: "row",
            gap: "8%",
            alignSelf: "center",
        },
        canardman: {
            position: "absolute",
            top: 12,
            right: -148,
            width: 336,
            height: 336,
            transform: [{ rotate: "5deg" }, { scaleX: -1 }],
            zIndex: -1,
        },
    });

