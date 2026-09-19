import { Text } from "@/components/core";
import { serializeHomework } from "@/features/homeworks/utils/homeworks";
import { useCustomDataStore } from "@/hooks/useCustomDataStore";
import { useHaptic } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useThemeStore";
import { addOpacity } from "@/utils/colorGenerator";
import { formatShortDate } from "@/utils/date";
import { FolderOpen, Maximize2, Trash2 } from "lucide-react-native";
import { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import AnimatedToggle from "./AnimatedToggle";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeworkCard({
    homework,
    dispatch,
    enabled = true,
    isExpanded = false,
    onToggleExpand,
    onOpenDocuments,
}) {
    const haptics = useHaptic("success");
    const handleOpenDocuments = () => {
        if (typeof onOpenDocuments === "function") {
            onOpenDocuments(homework.homeworksContent?.joinedDocuments, homework);
        } else if (typeof dispatch === "function") {
            dispatch({
                type: "OPEN_DOCUMENT_MODAL",
                payload: homework.homeworksContent?.joinedDocuments,
            });
        }
    };

    const handlePress = () => {
        dispatch({
            type: "SEE_HOMEWORK_DETAILS",
            payload: serializeHomework(homework),
        });
    };
    const handleToggle = () => {
        if (homework.loadingState === "loading" || homework.loadingState === "error")
            return;
        const nextIsDoneBoolean = homework.isDone !== "done";
        haptics();
        dispatch({
            type: "TOGGLE_HOMEWORK",
            payload: {
                id: homework.id,
                isCustom: homework.isCustom,
                updates: { isDone: nextIsDoneBoolean },
            },
        });
    };

    const removeCustomHomework = useCustomDataStore(
        (state) => state.removeCustomHomework
    );

    const { colors } = useTheme();

    const handleToggleExpand = useCallback(
        (id = homework?.id) => {
            if (typeof onToggleExpand === "function") {
                onToggleExpand(id ?? homework?.id);
            }
        },
        [onToggleExpand, homework?.id]
    );

    return (
        <AnimatedTouchableOpacity
            layout={LinearTransition.springify()}
            onPress={handleToggleExpand}
            activeOpacity={1}
            disabled={!enabled}
            style={{
                backgroundColor: colors.secondary,
                width: "100%",
                borderRadius: 20,
                overflow: "hidden",
                paddingTop: 17,
                paddingHorizontal: 20,
                borderColor: homework.discipline?.color || "grey",
                borderWidth: isExpanded ? 1 : 0,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 50,
                }}
            >
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            gap: 7,
                            alignItems: "flex-start",
                            alignSelf: "flex-start",
                            marginRight: 12,
                            zIndex: 2000,
                            marginTop: -5,
                        }}
                    >
                        <Text
                            oneLine
                            style={{
                                fontSize: 18,
                                fontFamily: "Bold",
                                color: homework.discipline?.color || "grey",
                            }}
                        >
                            {homework.discipline.name}
                        </Text>
                        {homework.isEvaluation && (
                            <View
                                style={{
                                    paddingTop: 1,
                                    paddingHorizontal: 8,
                                    borderWidth: 1,
                                    borderRadius: 7,
                                    borderColor: addOpacity("#F87171", 0.2),
                                    backgroundColor: addOpacity("#F87171", 0.12),
                                    flexShrink: 1,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#F87171",
                                        fontSize: 14,
                                        fontFamily: "Medium",
                                    }}
                                >
                                    Contrôle
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text
                        style={{
                            fontSize: 12,
                            fontFamily: "Medium",
                            color: colors.contrast,
                        }}
                    >
                        {homework.discipline.teacher}
                    </Text>
                </View>

                <AnimatedToggle
                    isDone={homework.isDone}
                    loadingState={homework.loadingState}
                    onToggle={handleToggle}
                />
            </View>

            {/* CONTENT */}
            <View
                style={{
                    alignItems: "center",
                    overflow: "hidden",
                    height: isExpanded ? undefined : 0,
                }}
            >
                <View
                    style={{
                        height: 1.5,
                        width: "95%",
                        borderRadius: 2,
                        backgroundColor: addOpacity(colors.contrast, 0.4),
                        marginTop: 12,
                    }}
                />

                <Text
                    style={{
                        color: colors.contrast,
                        padding: 12,
                        fontSize: 14,
                        fontFamily: "Lexend-Regular",
                    }}
                >
                    {homework.plainText}
                </Text>

                <View
                    style={{
                        height: 1.5,
                        width: "95%",
                        borderRadius: 2,
                        backgroundColor: addOpacity(colors.contrast, 0.4),
                        marginBottom: 12,
                    }}
                />
            </View>

            <Animated.View
                layout={LinearTransition.springify()}
                style={{
                    marginTop: isExpanded ? -10 : -32,
                    paddingTop: 10,
                    paddingBottom: 17,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: colors.secondary,
                }}
            >
                <Text
                    style={{
                        fontSize: 12,
                        fontFamily: "Medium",
                        color: colors.contrast,
                    }}
                >
                    Donnée le {formatShortDate(homework.givenOn)}
                </Text>
                {isExpanded && (
                    <Animated.View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            gap: 20,
                        }}
                    >
                        <TouchableOpacity
                            onPress={handlePress}
                            style={{ margin: -2 }}
                            hitSlop={8}
                        >
                            <Maximize2 size={20} color={colors.contrast} />
                        </TouchableOpacity>
                        {homework.homeworksContent.joinedDocuments?.length > 0 && (
                            <TouchableOpacity
                                onPress={handleOpenDocuments}
                                style={{ margin: -2 }}
                                hitSlop={8}
                            >
                                <FolderOpen size={20} color={colors.contrast} />
                            </TouchableOpacity>
                        )}
                        {homework.isCustom && (
                            <TouchableOpacity
                                onPress={() => removeCustomHomework(homework.id)}
                                style={{ margin: -2 }}
                                hitSlop={8}
                            >
                                <Trash2 size={20} color="#F87171" />
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}
            </Animated.View>
        </AnimatedTouchableOpacity>
    );
}

