import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

import { Text } from "@/components/core";
import { Plus } from "@/components/svg";
import { motivationSentences } from "@/constants/features/homeworksConfig";
import HomeworkCard from "@/features/homeworks/components/HomeworkCard";
import HomeworkDatesRow from "@/features/homeworks/components/HomeworkDatesRow";
import HomeworkProgress from "@/features/homeworks/components/HomeworkProgress";

import DocumentModal from "@/features/homeworks/components/DocumentModal";
import NewHomeworkModal from "@/features/homeworks/components/NewHomeworkModal";
import { useHomework } from "@/features/homeworks/context/HomeworkContext";
import { useHomeworksHandler } from "@/features/homeworks/hooks/useHomeworksHandler";
import { formatFrenchDate } from "@/utils/date";

import { ScreenStack } from "@/components";
import { useHomeworks } from "@/features/homeworks";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { useUserStore } from "@/hooks/useUserStore";
import { objectsEqual } from "@/utils/json";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useThemeStore";
import { addOpacityToCssRgb } from "@/utils/colorGenerator";
import Animated, { LinearTransition } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeworksContent() {
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const {
        data: homeworksData,
        isLoading,
        isError,
        toggleHomework,
        error,
        isDataEmpty,
    } = useHomeworks(token);
    const customHomeworksData = useCustomDataStore((state) => state.customHomeworks);
    const { dispatch } = useHomework();

    const mergedHomeworks = useMemo(() => {
        if (!homeworksData) return null;
        const merged = JSON.parse(JSON.stringify(homeworksData));
        customHomeworksData.forEach((hw) => {
            if (!merged[hw.date]) {
                merged[hw.date] = [];
                if (!merged.formatedDates) merged.formatedDates = {};
                const frenchDate = formatFrenchDate(hw.date);
                const contractedDate = [
                    frenchDate.charAt(0).toLowerCase() + frenchDate.slice(1, 3),
                    frenchDate.split(" ")[1],
                ];
                merged.formatedDates[hw.date] = {
                    long: frenchDate,
                    contracted: contractedDate,
                    isEvaluation: hw.isEvaluation,
                    allTasksCompleted: false,
                };
            }
            const alreadyExists = merged[hw.date].some((h) => h.id === hw.id);
            if (!alreadyExists) {
                merged[hw.date].push(hw);
            }
        });
        return merged;
    }, [homeworksData, customHomeworksData]);

    const [activeDate, setActiveDate] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [documentModal, setDocumentModal] = useState({
        open: false,
        documents: [],
    });
    const [expandedHomeworkId, setExpandedHomeworkId] = useState(null);

    const handleItemPress = useCallback((id) => {
        setExpandedHomeworkId((prev) => (prev === id ? null : id));
    }, []);

    useEffect(() => {
        setExpandedHomeworkId(null);
    }, [activeDate]);

    useHomeworksHandler({
        setModalOpen,
        toggleHomework,
        setDocumentModal,
    });

    const homeworksDates = mergedHomeworks?.formatedDates;

    useEffect(() => {
        if (
            !mergedHomeworks?.formatedDates ||
            Object.keys(mergedHomeworks.formatedDates).length === 0
        )
            return;

        if (!activeDate || !mergedHomeworks.formatedDates[activeDate]) {
            setActiveDate(Object.keys(mergedHomeworks.formatedDates)[0]);
        }
    }, [mergedHomeworks, activeDate]);

    const displayTasks = useMemo(() => {
        if (!activeDate || !mergedHomeworks) return [];
        return mergedHomeworks[activeDate] || [];
    }, [activeDate, mergedHomeworks]);

    const completedTasks = useMemo(() => {
        return displayTasks.filter(({ isDone }) => isDone === "done");
    }, [displayTasks]);

    const progression = useMemo(() => {
        return displayTasks.length > 0
            ? Math.round((completedTasks.length / displayTasks.length) * 100) / 100
            : 0;
    }, [displayTasks, completedTasks]);

    const encouragementSentence = useMemo(() => {
        let key;
        if (progression === 0) key = "0";
        else if (progression < 0.25) key = "0.25";
        else if (progression < 0.5) key = "0.5";
        else if (progression < 1) key = "0.75";
        else key = "1";

        const sentences = motivationSentences[key];
        return sentences
            ? sentences[Math.floor(Math.random() * sentences.length)]
            : "";
    }, [progression]);

    return (
        <>
            <NewHomeworkModal visible={modalOpen} defaultDate={activeDate} />
            <DocumentModal
                visible={documentModal.open}
                setVisible={(open) =>
                    setDocumentModal((prev) => ({ ...prev, open }))
                }
                documents={documentModal.documents}
            />
            <ScreenStack>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 40,
                    }}
                >
                    <HomeworkProgress
                        completedCount={completedTasks.length}
                        totalCount={displayTasks.length}
                        progression={progression}
                        encouragementSentence={encouragementSentence}
                    />

                    <HomeworkDatesRow
                        homeworksDates={homeworksDates}
                        activeDate={activeDate}
                        setActiveDate={setActiveDate}
                        mergedHomeworks={mergedHomeworks}
                    />

                    <View
                        style={{
                            paddingHorizontal: 24,
                            gap: 10,
                        }}
                        key={activeDate}
                    >
                        {objectsEqual({}, homeworksData) && (
                            <Text>
                                Chouette, vous n'avez pas de devoirs donnés par votre
                                établissement !
                                <Text preset="label3" color="grey">
                                    (annonce immonde a revoir et penser a faire un
                                    compteur de devoir etab et devoirs custom)
                                </Text>
                            </Text>
                        )}
                        {displayTasks.map((homework) => (
                            <HomeworkCard
                                key={homework.id}
                                dispatch={dispatch}
                                homework={homework}
                                isExpanded={expandedHomeworkId === homework.id}
                                onToggleExpand={() => handleItemPress(homework.id)}
                                onOpenDocuments={(documents) =>
                                    setDocumentModal({ open: true, documents })
                                }
                            />
                        ))}
                        <AnimatedTouchableOpacity
                            layout={LinearTransition.springify()}
                            style={{
                                paddingHorizontal: 6,
                                backgroundColor: addOpacityToCssRgb(
                                    colors.main,
                                    0.7
                                ),
                                borderRadius: 12,
                                width: 55,
                                alignItems: "center",
                                alignSelf: "center",
                            }}
                            onPress={() =>
                                dispatch({ type: "OPEN_NEW_HOMEWORK_MODAL" })
                            }
                        >
                            <Plus size={30} />
                        </AnimatedTouchableOpacity>
                    </View>
                </ScrollView>
            </ScreenStack>
        </>
    );
}

