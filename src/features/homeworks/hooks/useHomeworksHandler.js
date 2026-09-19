import { createHomework } from "@/features/homeworks/utils/homeworks";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { routesNames } from "@/router/config/routesNames";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useHomework } from "../context/HomeworkContext";

export const useHomeworksHandler = ({
    setModalOpen,
    toggleHomework,
    setDocumentModal,
}) => {
    const navigation = useNavigation();
    const addCustomHomework = useCustomDataStore((state) => state.addCustomHomework);
    const removeCustomHomework = useCustomDataStore(
        (state) => state.removeCustomHomework
    );
    const toggleCustomHomeworkDone = useCustomDataStore(
        (state) => state.toggleCustomHomeworkDone
    );
    const { state, dispatch } = useHomework();

    useEffect(() => {
        if (state.homeworksData) {
            navigation.navigate(routesNames.client.homeworks.details, {
                homeworksData: state.homeworksData,
            });
            dispatch({ type: "RESET" });
        }
    }, [state.homeworksData, navigation]);

    useEffect(() => {
        if (state.toggle) {
            if (state.toggle.isCustom) {
                toggleCustomHomeworkDone(state.toggle.id);
            } else {
                toggleHomework({
                    id: state.toggle.id,
                    state: state.toggle.updates.isDone,
                });
            }
            dispatch({ type: "RESET" });
        }
    }, [state.toggle, toggleHomework, toggleCustomHomeworkDone, dispatch]);

    useEffect(() => {
        if (state.new.modalOpen !== undefined) {
            setModalOpen(state.new.modalOpen);
        }
    }, [setModalOpen, state.new.modalOpen]);

    useEffect(() => {
        if (state.documentModal?.open !== undefined && setDocumentModal) {
            setDocumentModal(state.documentModal);
        }
    }, [setDocumentModal, state.documentModal]);

    useEffect(() => {
        const { discipline, date, content, md5Key, isEvaluation } = state.new;
        if (!discipline || !date || !content) return;

        const homework = createHomework({
            discipline,
            date,
            isEvaluation,
            homeworksContent: { content },
            customHomeworkMd5Key: md5Key,
            id: hashToNumberInRange(14000, 19998, md5Key),
            isCustom: true,
        });
        addCustomHomework(homework);
        dispatch({ type: "RESET" });
    }, [
        state.new.discipline,
        state.new.date,
        state.new.content,
        state.new.isEvaluation,
    ]);

    useEffect(() => {
        if (!state.homeworkToRemove) return;

        const { date, id, customHomeworkMd5Key } = state.homeworkToRemove;

        removeCustomHomework(id);

        dispatch({ type: "RESET" });
    }, [state.homeworkToRemove]);
};

const hashToNumberInRange = (min, max, hash) => {
    const hashInt = parseInt(hash.substring(0, 8), 16);
    return min + (hashInt % (max - min + 1));
};

