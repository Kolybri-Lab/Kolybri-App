import { Text } from "@/components/core";
import { useHomeworks } from "@/features/homeworks";
import DocumentModal from "@/features/homeworks/components/DocumentModal";
import HomeworkCard from "@/features/homeworks/components/HomeworkCard";
import { useHomework } from "@/features/homeworks/context/HomeworkContext";
import {
    createHomework,
    decodeHomeworkContent,
    serializeHomework,
} from "@/features/homeworks/utils/homeworks";
import { useUserStore } from "@/hooks/useUserStore";
import { formatFrenchDate } from "@/utils/date";
import { useNavigation, useTheme } from "@react-navigation/native";
import { useMemo, useState } from "react";
import {
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { routesNames } from "@/router/config/routesNames";
import { GoBackHeader, Modal } from "../../../components";

export default function HomeworkDetails({ route }) {
    const { homeworksData = {} } = route?.params || {};

    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    const { dispatch } = useHomework();
    const { colors } = useTheme();
    const userAccesToken = useUserStore((state) => state.token);
    const { data: homeworksQueryData } = useHomeworks(userAccesToken);

    const modalsHander = {
        document: useState(false),
        courseContent: useState(false),
    };

    const homework = useMemo(() => {
        const current =
            homeworksQueryData?.[homeworksData.date]?.find(
                (hw) => hw.id === homeworksData.id
            ) ?? homeworksData;

        const hw = createHomework(current);
        return hw.isCustom ? serializeHomework(hw) : decodeHomeworkContent(hw);
    }, [homeworksQueryData, homeworksData]);

    const homeworkContent = homework.isCustom
        ? homework.homeworksContent.content
        : homework.homeworksContent.renderHtml || homework.decodedHTMLHomework;

    const tagsStyles = useMemo(
        () => ({
            u: { textDecorationLine: "underline" },
            i: { fontStyle: "italic" },
            strong: { fontWeight: 700 },
        }),
        []
    );

    const baseStyle = useMemo(
        () => ({
            color: colors.contrast,
        }),
        [colors.contrast]
    );

    const HomeworkHTML = useMemo(
        () => (
            <RenderHTML
                contentWidth={width}
                source={{ html: homeworkContent }}
                ignoredDomTags={["script", "iframe", "object"]}
                baseStyle={baseStyle}
                tagsStyles={tagsStyles}
            />
        ),
        [homeworkContent, baseStyle, tagsStyles, width]
    );

    const CourseHTML = useMemo(
        () => (
            <RenderHTML
                contentWidth={width}
                source={{ html: homework.decodedHTMLCourseContent }}
                ignoredDomTags={["script", "iframe", "object"]}
                baseStyle={baseStyle}
                tagsStyles={tagsStyles}
            />
        ),
        [homework.decodedHTMLCourseContent, baseStyle, tagsStyles, width]
    );

    return (
        <View style={{ backgroundColor: colors.background.gradient[1], flex: 1 }}>
            <DocumentModal
                visible={modalsHander.document[0]}
                setVisible={modalsHander.document[1]}
                documents={homework.homeworksContent?.joinedDocuments}
            />

            <CourseContentModal
                visible={modalsHander.courseContent[0]}
                setVisible={modalsHander.courseContent[1]}
                courseHTML={CourseHTML}
            />

            <View
                style={{
                    flex: 1,
                    /*backgroundColor: Array.isArray(colors.background.gradient)
                        ? colors.background.gradient[0]
                        : colors.background.gradient,*/
                    marginHorizontal: 20,
                    marginBottom: 110,
                }}
            >
                <GoBackHeader fallbackRoute={routesNames.client.homeworks.content} />
                <View style={{ flex: 1, gap: 18 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ width: "100%" }}
                        onLongPress={() => {
                            if (homework.isCustom) {
                                dispatch({
                                    type: "REMOVE_CUSTOM_HOMEWORK",
                                    payload: serializeHomework(homework),
                                });
                                navigation.goBack();
                            }
                        }}
                    >
                        <HomeworkCard
                            dispatch={dispatch}
                            enabled={false}
                            homework={homework}
                            onOpenDocuments={() => modalsHander.document[1](true)}
                        />
                    </TouchableOpacity>

                    <View
                        style={{
                            backgroundColor: colors.secondary,
                            flex: 1,
                            padding: 25,
                            borderRadius: 21,
                        }}
                    >
                        <Text
                            preset="title1"
                            align="center"
                            decoration="underline"
                            style={{ marginBottom: 20 }}
                        >
                            Pour le{" "}
                            {formatFrenchDate(homeworksData.date).replace(
                                /^[A-Z]/,
                                (match) => match.toLowerCase()
                            )}
                        </Text>
                        <ScrollView style={{ flex: 1 }}>
                            {homework.isCustom ? (
                                <Text>{homeworkContent}</Text>
                            ) : (
                                HomeworkHTML
                            )}
                        </ScrollView>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            gap: 10,
                            marginHorizontal: 15,
                            minHeight: "6%",
                        }}
                    >
                        {homeworksData.isCustom ? (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: 1,
                                }}
                            >
                                <Text preset="label2">
                                    Vous êtes dans un devoir personnalisé
                                </Text>
                            </View>
                        ) : (
                            <>
                                {homework.homeworksContent?.joinedDocuments?.length >
                                    0 && (
                                    <TouchableOpacity
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.secondary,
                                            borderRadius: 12,
                                            justifyContent: "center",
                                        }}
                                        onPress={() =>
                                            modalsHander.document[1](true)
                                        }
                                    >
                                        <Text
                                            align="center"
                                            preset="label2"
                                            color={colors.bg.bg5}
                                        >
                                            Documents (
                                            {
                                                homework.homeworksContent
                                                    .joinedDocuments.length
                                            }
                                            )
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: colors.secondary,
                                        borderRadius: 12,
                                        justifyContent: "center",
                                    }}
                                    onPress={() =>
                                        modalsHander.courseContent[1](true)
                                    }
                                >
                                    <Text
                                        align="center"
                                        preset="label2"
                                        color={colors.bg.bg5}
                                    >
                                        Contenu séance
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}



const CourseContentModal = ({ visible, setVisible, courseHTML }) => {
    return (
        <Modal visible={visible} handleClose={() => setVisible((prev) => !prev)}>
            <ScrollView style={{ flex: 1 }}>{courseHTML}</ScrollView>
        </Modal>
    );
};

