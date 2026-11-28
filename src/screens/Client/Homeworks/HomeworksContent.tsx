import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View } from "react-native";

import { ScreenStack } from "@/components";
import { Text } from "@/components/core";
import { KolybriFreeLottie, type AnimatedLottieHandle } from "@/components/lottie";
import { motivationSentences } from "@/constants/features/homeworksConfig";
import { useHomeworks } from "@/features/homeworks";
import DocumentModal, {
    type HomeworkDocument,
} from "@/features/homeworks/components/DocumentModal";
import HomeworkCard from "@/features/homeworks/components/HomeworkCard";
import HomeworkDatesRow from "@/features/homeworks/components/HomeworkDatesRow";
import HomeworkProgress from "@/features/homeworks/components/HomeworkProgress";
import NewHomeworkModal from "@/features/homeworks/components/NewHomeworkModal";
import { useHomework } from "@/features/homeworks/context/HomeworkContext";
import { useHomeworksHandler } from "@/features/homeworks/hooks/useHomeworksHandler";
import type { Homework } from "@/features/homeworks/types";
import { useTheme } from "@/hooks/useThemeStore";
import { useUserStore } from "@/hooks/useUserStore";
import { Plus } from "lucide-react-native";
import type { ComponentType } from "react";
import Animated, { LinearTransition } from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const ScreenStackView = ScreenStack as ComponentType<any>;
const HomeworkProgressView = HomeworkProgress as ComponentType<any>;
const HomeworkDatesRowView = HomeworkDatesRow as ComponentType<any>;

export default function HomeworksContent() {
    const { colors } = useTheme();
    const token = useUserStore((state) => state.token);
    const {
        data: homeworksData,
        isLoading,
        toggleHomework,
    } = useHomeworks(token);
    const { dispatch } = useHomework();

    const [activeDate, setActiveDate] = useState<string>("");
    const [modalOpen, setModalOpen] = useState(false);
    const [documentModal, setDocumentModal] = useState<{
        open: boolean;
        documents: HomeworkDocument[];
    }>({
        open: false,
        documents: [],
    });
    const [expandedHomeworkId, setExpandedHomeworkId] = useState<number | null>(null);
    const freeAnimRef = useRef<AnimatedLottieHandle | null>(null);

    const handleItemPress = useCallback((id: number) => {
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

    const homeworksDates = homeworksData?.formatedDates;

    useEffect(() => {
        if (!homeworksDates || Object.keys(homeworksDates).length === 0) return;

        if (!activeDate || !homeworksDates[activeDate]) {
            setActiveDate(Object.keys(homeworksDates)[0]);
        }
    }, [homeworksDates, activeDate]);

    const displayTasks = useMemo<Homework[]>(() => {
        if (!activeDate || !homeworksData) return [];
        const tasks = homeworksData[activeDate];
        return Array.isArray(tasks) ? tasks : [];
    }, [activeDate, homeworksData]);

    const hasDates = Boolean(homeworksDates && Object.keys(homeworksDates).length > 0);
    const isEmpty =
        !isLoading &&
        (!hasDates || (Boolean(activeDate) && displayTasks.length === 0));

    useEffect(() => {
        if (isEmpty) {
            freeAnimRef.current?.reset();
            freeAnimRef.current?.play(6, 60);
        }
    }, [isEmpty]);

    const completedTasks = useMemo(() => {
        return displayTasks.filter(({ isDone }) => isDone === "done");
    }, [displayTasks]);

    const progression = useMemo(() => {
        return displayTasks.length > 0
            ? Math.round((completedTasks.length / displayTasks.length) * 100) / 100
            : 0;
    }, [displayTasks, completedTasks]);

    const encouragementSentence = useMemo(() => {
        let key: keyof typeof motivationSentences;
        if (progression === 0) key = 0;
        else if (progression < 0.25) key = 0.25;
        else if (progression < 0.5) key = 0.5;
        else if (progression < 1) key = 0.75;
        else key = 1;

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
                setVisible={(open: boolean | ((prev: boolean) => boolean)) =>
                    setDocumentModal((prev) => ({
                        ...prev,
                        open: typeof open === "function" ? open(prev.open) : open,
                    }))
                }
                documents={documentModal.documents}
            />
            <ScreenStackView>
                {isEmpty ? (
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: 24,
                            paddingBottom: 40,
                            gap: 14,
                        }}
                    >
                        <Text
                            preset="heading.section"
                            weight="bold"
                            align="center"
                        >
                            Pas de devoir ! Tu es libre !
                        </Text>
                        <Pressable
                            onPress={() => freeAnimRef.current?.play(10, 60)}
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <KolybriFreeLottie
                                ref={freeAnimRef}
                                loop={false}
                                speed={1.35}
                                style={{
                                    width: 280,
                                    height: 280,
                                }}
                            />
                        </Pressable>
                        <Text
                            preset="body.md"
                            align="center"
                            color={colors.text.secondary}
                        >
                            Un devoir oublié par ton prof ? Ajoute-le ci-dessous !
                        </Text>
                        <TouchableOpacity
                            style={{
                                paddingHorizontal: 6,
                                paddingVertical: 3,
                                backgroundColor: colors.brand.primary,
                                borderRadius: 12,
                                width: 55,
                                alignItems: "center",
                                marginTop: 4,
                            }}
                            onPress={() =>
                                dispatch({ type: "OPEN_NEW_HOMEWORK_MODAL" })
                            }
                        >
                            <Plus
                                size={24}
                                color={colors.text.onBrand}
                                strokeWidth={3}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 40,
                        }}
                    >
                        <HomeworkProgressView
                            completedCount={completedTasks.length}
                            totalCount={displayTasks.length}
                            progression={progression}
                            encouragementSentence={encouragementSentence}
                        />

                        <HomeworkDatesRowView
                            homeworksDates={homeworksDates}
                            activeDate={activeDate}
                            setActiveDate={setActiveDate}
                            mergedHomeworks={homeworksData}
                        />

                        <View
                            style={{
                                paddingHorizontal: 24,
                                gap: 10,
                            }}
                            key={activeDate}
                        >
                            {displayTasks.map((homework) => (
                                <HomeworkCard
                                    key={homework.id}
                                    dispatch={dispatch}
                                    homework={homework}
                                    isExpanded={expandedHomeworkId === homework.id}
                                    onToggleExpand={() => handleItemPress(homework.id)}
                                    onOpenDocuments={(documents: HomeworkDocument[]) =>
                                        setDocumentModal({ open: true, documents })
                                    }
                                />
                            ))}
                            <AnimatedTouchableOpacity
                                layout={LinearTransition.springify()}
                                style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 3,
                                    backgroundColor: colors.brand.primary,
                                    borderRadius: 12,
                                    width: 55,
                                    alignItems: "center",
                                    alignSelf: "center",
                                }}
                                onPress={() =>
                                    dispatch({ type: "OPEN_NEW_HOMEWORK_MODAL" })
                                }
                            >
                                <Plus
                                    size={24}
                                    color={colors.text.onBrand}
                                    strokeWidth={3}
                                />
                            </AnimatedTouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </ScreenStackView>
        </>
    );
}
