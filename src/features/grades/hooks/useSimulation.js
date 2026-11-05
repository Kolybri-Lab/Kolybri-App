import { routesNames } from "@/router/config/routesNames";
import { objectsEqual } from "@/utils/json";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import Discipline from "../models/Discipline";
import Grade from "../models/Grade";
import Period from "../models/Period";

export const useSimulation = ({
    state,
    dispatch,
    displayPeriodeName,
    setSimulatedDisciplineCodes,
    setRenderDisciplineArray,
    renderDisciplinesArray,
    displayPeriode,
    setDisplayPeriode,
    setGeneralAverage,
}) => {
    const navigation = useNavigation();

    useEffect(() => {
        if (state.gradeData) {
            const discipline = renderDisciplinesArray?.find(
                ({ code }) => code === state.gradeData.codes?.discipline
            );

            navigation.navigate(routesNames.client.grades.details, {
                gradeData: state.gradeData,
                disciplineData: discipline,
            });
            dispatch({ type: "RESET_GRADE_DETAILS" });
        }
    }, [state.gradeData, navigation, dispatch, renderDisciplinesArray]);

    useEffect(() => {
        if (state.simulation.disciplineCode) {
            setSimulatedDisciplineCodes({
                ...state.simulation.disciplineCode,
                period: displayPeriodeName,
            });
        }
    }, [
        state.simulation.disciplineCode,
        displayPeriodeName,
        setSimulatedDisciplineCodes,
    ]);

    useEffect(() => {
        if (state.gradeToRemove && displayPeriode?.groups) {
            const gradeToDelete = new Grade(state.gradeToRemove);
            const gradeObj = gradeToDelete.getGrade();

            const updatedGroups = displayPeriode.groups.map((group) => {
                if (group.isDisciplineGroup && Array.isArray(group.disciplines)) {
                    const updatedDisciplines = group.disciplines.map(
                        (discipline) => {
                            if (discipline.code === gradeToDelete.codes.discipline) {
                                const newGrades = (discipline.grades || []).filter(
                                    (g) =>
                                        !objectsEqual(
                                            new Grade(g).getGrade(),
                                            gradeObj
                                        )
                                );
                                const tempDiscipline = new Discipline({
                                    ...discipline,
                                    grades: newGrades,
                                });
                                const calculatedAvg =
                                    tempDiscipline.getWeightedAverage();
                                return {
                                    ...discipline,
                                    grades: newGrades,
                                    averageDatas: {
                                        ...discipline.averageDatas,
                                        userAverage: calculatedAvg,
                                    },
                                };
                            }
                            return discipline;
                        }
                    );

                    const tempGroup = new Discipline({
                        ...group,
                        disciplines: updatedDisciplines,
                    });
                    const calculatedGroupAvg = tempGroup.getDisciplineGroupAverage();

                    return {
                        ...group,
                        disciplines: updatedDisciplines,
                        averageDatas: {
                            ...group.averageDatas,
                            userAverage: calculatedGroupAvg,
                        },
                    };
                } else if (group.code === gradeToDelete.codes.discipline) {
                    const newGrades = (group.grades || []).filter(
                        (g) => !objectsEqual(new Grade(g).getGrade(), gradeObj)
                    );
                    const tempDiscipline = new Discipline({
                        ...group,
                        grades: newGrades,
                    });
                    const calculatedAvg = tempDiscipline.getWeightedAverage();
                    return {
                        ...group,
                        grades: newGrades,
                        averageDatas: {
                            ...group.averageDatas,
                            userAverage: calculatedAvg,
                        },
                    };
                }
                return group;
            });

            const updatedDisplayPeriode = {
                ...displayPeriode,
                groups: updatedGroups,
            };

            const newGeneralAvg = new Period(
                updatedDisplayPeriode,
                displayPeriodeName
            ).makeGeneralAverage();

            if (setDisplayPeriode) {
                setDisplayPeriode(updatedDisplayPeriode);
            }
            if (setGeneralAverage) {
                setGeneralAverage(newGeneralAvg);
            }
            dispatch({ type: "CLEAR_SIMULATED_GRADE" });
        }
    }, [
        state.gradeToRemove,
        displayPeriode,
        displayPeriodeName,
        setDisplayPeriode,
        setGeneralAverage,
        dispatch,
    ]);
    useEffect(() => {
        if (state.simulatedGrade && displayPeriode?.groups) {
            const simulatedGrade = new Grade(state.simulatedGrade);
            const gradeObj = simulatedGrade.getGrade();

            const updatedGroups = displayPeriode.groups.map((group) => {
                if (group.isDisciplineGroup && Array.isArray(group.disciplines)) {
                    const updatedDisciplines = group.disciplines.map(
                        (discipline) => {
                            if (
                                discipline.code === simulatedGrade.codes.discipline
                            ) {
                                const newGrades = [
                                    ...(discipline.grades || []),
                                    gradeObj,
                                ];
                                const tempDiscipline = new Discipline({
                                    ...discipline,
                                    grades: newGrades,
                                });
                                const calculatedAvg =
                                    tempDiscipline.getWeightedAverage();
                                return {
                                    ...discipline,
                                    grades: newGrades,
                                    averageDatas: {
                                        ...discipline.averageDatas,
                                        userAverage:
                                            calculatedAvg !== null &&
                                            calculatedAvg !== undefined
                                                ? calculatedAvg
                                                : discipline.averageDatas
                                                      ?.userAverage,
                                    },
                                };
                            }
                            return discipline;
                        }
                    );

                    const tempGroup = new Discipline({
                        ...group,
                        disciplines: updatedDisciplines,
                    });
                    const calculatedGroupAvg = tempGroup.getDisciplineGroupAverage();

                    return {
                        ...group,
                        disciplines: updatedDisciplines,
                        averageDatas: {
                            ...group.averageDatas,
                            userAverage:
                                calculatedGroupAvg !== null &&
                                calculatedGroupAvg !== undefined
                                    ? calculatedGroupAvg
                                    : group.averageDatas?.userAverage,
                        },
                    };
                } else if (group.code === simulatedGrade.codes.discipline) {
                    const newGrades = [...(group.grades || []), gradeObj];
                    const tempDiscipline = new Discipline({
                        ...group,
                        grades: newGrades,
                    });
                    const calculatedAvg = tempDiscipline.getWeightedAverage();
                    return {
                        ...group,
                        grades: newGrades,
                        averageDatas: {
                            ...group.averageDatas,
                            userAverage:
                                calculatedAvg !== null && calculatedAvg !== undefined
                                    ? calculatedAvg
                                    : group.averageDatas?.userAverage,
                        },
                    };
                }
                return group;
            });

            const updatedDisplayPeriode = {
                ...displayPeriode,
                groups: updatedGroups,
            };

            const newGeneralAvg = new Period(
                updatedDisplayPeriode,
                displayPeriodeName
            ).makeGeneralAverage();

            if (setDisplayPeriode) {
                setDisplayPeriode(updatedDisplayPeriode);
            }
            if (setGeneralAverage) {
                setGeneralAverage(newGeneralAvg);
            }
            dispatch({ type: "CLEAR_SIMULATED_GRADE" });
        }
    }, [
        state.simulatedGrade,
        displayPeriode,
        displayPeriodeName,
        setDisplayPeriode,
        setGeneralAverage,
        dispatch,
    ]);
};

